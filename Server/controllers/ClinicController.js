import { sendVerificationEmail, sendProviderVerificationStatusEmail} from "../middleware/Email.js";
import {ClinicModel} from '../models/Clinic.js'; 
import { VetModel } from "../models/Vet.js";
import { GroomerModel } from "../models/Groomer.js";

import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const GetClinicInfo = async (req, res) => {
  try {
    const token = req.cookies.clinicToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, unauthorized",
      });
    }

    // Decode the token to extract the clinic ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const clinicId = decoded.id; // Assuming clinicId is part of the token payload

    if (!clinicId) {
      return res.status(400).json({success: false, message: "Clinic ID is required",});
    }
    const clinic = await ClinicModel.findById(clinicId);

    if (!clinic) {
      return res.status(404).json({success: false, message: "Clinic not found",});
    }

    // Return the clinic data
    return res.status(200).json({ success: true, clinic,});
  } catch (error) {
    console.error("Error fetching clinic info:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const UpdateClinicProfile = async (req, res) => {
  try {
    const token = req.cookies.clinicToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const clinicId = decoded.id; // Assuming clinicId is part of the token payload

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        message: "Clinic ID is required",
      });
    }

    const clinic = await ClinicModel.findById(clinicId);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    const { email, phone, password } = req.body;

    if (email && email !== clinic.email) {
      const existingClinic = await ClinicModel.findOne({ email });
      if (existingClinic) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use. Please choose another one.",
        });
      }

      const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationTokenExpiresAt = Date.now() + 5 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000;

      clinic.email = email;
      clinic.emailVerified = false;
      clinic.verificationToken = verificationToken;
      clinic.verificationTokenExpiresAt = verificationTokenExpiresAt;

      setImmediate(async () => {
        try {
          await sendVerificationEmail(clinic.email, verificationToken);
        } catch (error) {
          console.error("Error sending verification email:", error);
        }
      });
    }
    if (phone) {
      clinic.phone = phone;
    }
    if (password) {
      const hashedPassword = bcryptjs.hashSync(password, 10);
      clinic.password = hashedPassword;
    }
    await clinic.save();

    return res.status(200).json({
      success: true,
      message: "Clinic profile updated successfully",
      clinic,
    });
  } catch (error) {
    console.error("Error updating clinic info:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const GetClinicsByCity = async (req, res) => {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ success: false, message: "City is required" });
    }

    const clinics = await ClinicModel.find({
      city: city,
      emailVerified: true,
      verificationStatus: 'verified',
    });

    if (clinics.length === 0) {
      return res.status(204).send();
    }

    return res.status(200).json({
      success: true,
      message: "Clinics fetched successfully",
      clinics,
    });
  } catch (error) {
    console.error("Error in getClinicsByCityHandler:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const GetRegisteredStaffByClinic = async (req, res) => {
  try {
    const token = req.cookies.clinicToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const clinicId = decoded.id; 

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        message: "Clinic ID is required",
      });
    }

    // Fetch all registered vets and groomers for the specific clinic with "verified" status
    const vets = await VetModel.find({ clinicId, verificationStatus: "verified" });
    const groomers = await GroomerModel.find({ clinicId, verificationStatus: "verified" });

    // If no verified vets or groomers found, return an empty response
    if (vets.length === 0 && groomers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No verified vets or groomers found for this clinic",
        vets: [],
        groomers: [],
      });
    }

    // Return the verified vets and groomers
    return res.status(200).json({
      success: true,
      vets,
      groomers,
    });
  } catch (error) {
    console.error("Error fetching registered staff:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const UpdateProviderVerificationStatus = async (req, res) => {
  try {
    const { providerId, status, type } = req.body; // Status can be 'verified' or 'rejected'

    // Validate inputs
    if (!providerId || !['verified', 'rejected'].includes(status) || !['vet', 'groomer'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid data provided.' });
    }

    const providerModel = type === 'vet' ? VetModel : GroomerModel;

    const provider = await providerModel.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found.` });
    }

    // Update verification status
    provider.verificationStatus = status;
    await provider.save();

    // Send email to the provider about the status update
    await sendProviderVerificationStatusEmail(provider.email, status, type);

    return res.status(200).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} ${status === 'verified' ? 'approved' : 'rejected'} successfully.`,
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const GetVetsAndGroomersByClinic = async (req, res) => {
  try {
    const token = req.cookies.clinicToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, unauthorized",
      });
    }

    // Decode the token to get the clinicId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const clinicId = decoded.id; // Assuming clinicId is part of the token payload

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        message: "Clinic ID is required",
      });
    }

    // Fetch all vets and groomers associated with the clinic and whose verificationStatus is 'pending'
    const vets = await VetModel.find({ clinicId, verificationStatus: 'pending' });
    const groomers = await GroomerModel.find({ clinicId, verificationStatus: 'pending' });

    // Check if there are no pending vets or groomers and return an empty response instead of an error
    if (vets.length === 0 && groomers.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No pending vets or groomers found',
        vets: [],
        groomers: [],
      });
    }

    return res.status(200).json({
      success: true,
      vets,
      groomers,
    });
  } catch (error) {
    console.error('Error fetching vets and groomers:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const GetProviderDetails = async (req, res) => {
    try {
      const { provider_id, role } = req.params;
      let provider = null;  
  
      if (role === "vet") {
        provider = await VetModel.findById(provider_id).lean();
      } else if (role === "groomer") {
        provider = await GroomerModel.findById(provider_id).lean();
      } else {
        return res.status(400).json({ error: "Invalid role specified" });
      }
  
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }
  
      return res.status(200).json({ provider });
    } catch (error) {
      console.error("Error fetching provider details:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
};