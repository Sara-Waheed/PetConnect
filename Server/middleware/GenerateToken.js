import jwt from 'jsonwebtoken';
import { UserModel } from "../models/User.js";
import {ClinicModel} from '../models/Clinic.js'; 
import { VetModel } from "../models/Vet.js";
import { GroomerModel } from "../models/Groomer.js";
import { SitterModel } from "../models/Sitter.js";

export const cookieJwtAuth = async (req, res, next) => {
  const roles = ['pet_owner', 'clinic', 'vet', 'groomer', 'sitter'];

  for (const role of roles) {
    const token = req.cookies?.[`${role}Token`];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== role) {
          throw new Error('Role mismatch');
        }
        let Model;
        switch (role) {
          case 'clinic':
            Model = ClinicModel;
            break;
          case 'vet':
            Model = VetModel;
            break;
          case 'groomer':
            Model = GroomerModel;
            break;
          case 'sitter':
            Model = SitterModel;
            break;
          case 'pet_owner':
            Model = UserModel;
        }

        const user = await Model.findById(decoded.id);
        if (!user) {
          throw new Error('User not found');
        }

        if (user.restricted) {
          res.clearCookie(`${role}Token`, {
            httpOnly: true,
            path: "/",
          });
          return res.status(403).json({
            success: false,
            message: 'Your account has been restricted. Please contact support.',
          });
        }

        req.user = decoded; // Attach the decoded token to the request object
        console.log("User in middleware:", decoded);
        return next(); // Proceed to the next middleware or route handler
      } catch (error) {
        console.warn(`Invalid or expired token for ${role}:`, error.message);
        req.user = null; // Clear the user object on error
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }
    }
  }

  req.user = null;
  return res.status(401).json({
    success: false,
    message: 'No valid authentication token found',
  });
};

export default cookieJwtAuth;
