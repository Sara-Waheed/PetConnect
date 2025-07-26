import { sendVerification1Email, sendResetPasswordEmail} from "../middleware/Email.js";
import { UserModel } from "../models/User.js";
import {ClinicModel} from '../models/Clinic.js'; 
import { VetModel } from "../models/Vet.js";
import { GroomerModel } from "../models/Groomer.js";
import { SitterModel } from "../models/Sitter.js";

import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const RegisterProvider = async (req, res) => {

  try {
    const { name, email, phone, password, city, clinic, yearsOfExperience, role } = req.body;
    let provider;

    // Ensure required fields are present
    if (!name || !email || !password || !phone || !city || !yearsOfExperience || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    let foundClinic;
    if(role !== 'sitter'){
      foundClinic = await ClinicModel.findOne({ _id: clinic });
      if (!foundClinic) {
        return res.status(400).json({ success: false, message: "Clinic not found" });
      }
    }

    // Check if the provider already exists by email based on the role
    if (role === "vet") {
      provider = await VetModel.findOne({ email });
    } else if (role === "groomer") {
      provider = await GroomerModel.findOne({ email });
    } else if (role === "sitter") {
      provider = await SitterModel.findOne({ email });
    }

    if (provider) {
      return res.status(400).json({ success: false, message: `${role} already exists. Please login.` });
    }

    // Asynchronous password hashing
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpiresAt = Date.now() + 5 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000;

    // Extract file buffers from Multer request
    const vetResumeBuffer = req.files['vetResume']?.[0]?.buffer;
    const vetLicenseBuffer = req.files['vetLicenseFile']?.[0]?.buffer;
    const vetDegreeBuffer = req.files['vetDegree']?.[0]?.buffer;
    const groomerCertificateBuffer = req.files['groomerCertificate']?.[0]?.buffer;
    const sitterCertificateBuffer = req.files['sitterCertificate']?.[0]?.buffer;
    const profilePhotoBuffer = req.files['profilePhoto']?.[0]?.buffer;
    const profilePhotoMimetype = req.files['profilePhoto']?.[0]?.mimetype;


    // Ensure all required files are uploaded for specific roles
    if (role === "vet" && (!vetResumeBuffer || !vetLicenseBuffer || !vetDegreeBuffer || !clinic)) {
      return res.status(400).json({ success: false, message: "All required files (resume, license, degree) must be uploaded for Veterinarian" });
    }

    if (role === "groomer" && (!groomerCertificateBuffer || !clinic)) {
      return res.status(400).json({ success: false, message: "Grooming Certificate is required for Pet Groomer" });
    }

    if (role === "sitter" && !sitterCertificateBuffer) {
      return res.status(400).json({ success: false, message: "Sitter Certificate is required for Pet Sitter" });
    }

    // Create the provider registration document with the clinicId
    if (role === "vet") {
      provider = new VetModel({
        name,
        email,
        phone,
        password: hashedPassword,
        city,
        yearsOfExperience,
        vetResume: vetResumeBuffer,
        vetLicenseFile: vetLicenseBuffer,
        vetDegree: vetDegreeBuffer,
        verificationToken,
        verificationTokenExpiresAt,
        verificationStatus: "pending",
        clinicId: foundClinic._id,
        profilePhoto: profilePhotoBuffer
      ? { data: profilePhotoBuffer, contentType: profilePhotoMimetype }
      : undefined,
      });
    } else if (role === "groomer") {
      provider = new GroomerModel({
        name,
        email,
        phone,
        password: hashedPassword,
        city,
        yearsOfExperience,
        groomerCertificate: groomerCertificateBuffer,
        groomingSpecialties: req.body.groomingSpecialties,
        verificationToken,
        verificationTokenExpiresAt,
        verificationStatus: "pending",
        clinicId: foundClinic._id, 
        profilePhoto: profilePhotoBuffer
      ? { data: profilePhotoBuffer, contentType: profilePhotoMimetype }
      : undefined,
      });
    } else if (role === "sitter") {
      provider = new SitterModel({
        name,
        email,
        phone,
        password: hashedPassword,
        city,
        yearsOfExperience,
        sitterAddress: req.body.sitterAddress,
        sitterCertificate: sitterCertificateBuffer,
        sittingExperience: req.body.sittingExperience,
        verificationToken,
        verificationTokenExpiresAt,
        verificationStatus: "pending",
        profilePhoto: profilePhotoBuffer
      ? { data: profilePhotoBuffer, contentType: profilePhotoMimetype }
      : undefined,
      });
    }

    // Save the provider document to the database
    await provider.save();

    // Send verification email (asynchronous)
    setImmediate(async () => {
      try {
        await sendVerification1Email(provider.email, verificationToken);
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    });

    return res.status(200).json({
      success: true,
      message: `${role} registered successfully. Verification email sent.`,
      provider,
    });
  } catch (error) {
    console.error("Error in RegisterProvider:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const Profile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json({
        success: false,
        message: "User not authenticated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User is authenticated",
      user: req.user, // Use the user set by the cookieJwtAuth middleware
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const Register = async (req, res) => {
  try {
    const { email, password, name, phone, city } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const ExistsUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (ExistsUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists. Please login." });
    }

    // Asynchronous password hashing
    const hashPassword = bcryptjs.hashSync(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const verificationTokenExpiresAt = Date.now() + 5 * 60 * 60 * 1000 + 15 * 60 * 1000;

    const user = new UserModel({
      email,
      password: hashPassword,
      name,
      phone,
      city,
      verificationToken: verificationToken,
      verificationTokenExpiresAt, // Correct expiration time in UTC+5
    });

    await user.save();

    setImmediate(async () => {
      try {
        await sendVerification1Email(user.email, verificationToken);
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    });

    return res.status(200).json({
      success: true,
      message: "User registered successfully. Verification email sent.",
      user,
    });
  } catch (error) {
    console.error("Error in Register:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const RegisterClinic = async (req, res) => {
  try {
    const { clinicName, email, phone, password, city, address } = req.body;
    
    if (!clinicName || !email || !password || !phone || !city || !address) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if the clinic already exists by email
    const existingClinic = await ClinicModel.findOne({ email });
    if (existingClinic) {
      return res
        .status(400)
        .json({ success: false, message: 'Clinic already exists. Please login.' });
    }

    // Asynchronous password hashing
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const verificationTokenExpiresAt = Date.now() + 5 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000;

    // Extract file buffers from Multer request (since you're using memory storage)
    const clinicRegistrationFileBuffer = req.files['clinicRegistrationFile']?.[0]?.buffer;
    const NICFileBuffer = req.files['NICFile']?.[0]?.buffer;
    const vetLicenseFileBuffer = req.files['vetLicenseFile']?.[0]?.buffer;
    const proofOfAddressFileBuffer = req.files['proofOfAddressFile']?.[0]?.buffer;

    // Ensure all required files are uploaded
    if (!clinicRegistrationFileBuffer || !NICFileBuffer || !vetLicenseFileBuffer || !proofOfAddressFileBuffer) {
      return res.status(400).json({ success: false, message: 'All required files must be uploaded.' });
    }
    const clinic = new ClinicModel({
      clinicName,
      email,
      phone,
      password: hashedPassword,
      city,
      address,
      verificationToken:  verificationToken,
      verificationTokenExpiresAt,
      clinicRegistrationFile: clinicRegistrationFileBuffer, // Store buffer or URL if uploaded externally
      NICFile: NICFileBuffer, // Store buffer or URL if uploaded externally
      vetLicenseFile: vetLicenseFileBuffer, // Store buffer or URL if uploaded externally
      proofOfAddressFile: proofOfAddressFileBuffer, // Store buffer or URL if uploaded externally
      verificationStatus: 'pending',
    });

    await clinic.save();

    setImmediate(async () => {
      try {
        await sendVerification1Email(clinic.email, verificationToken);
      } catch (error) {
        console.error('Error sending verification email:', error);
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Clinic registered successfully. Verification email sent.',
      clinic,
    });
  } catch (error) {
    console.error('Error in RegisterClinic:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Verify Email Function
export const VerifyEmail = async (req, res) => {
  try {
    const { code, type, role } = req.body;
  console.log("code:", code, "type:", type, "role", role );


    if (!code || !type || !role) {
      return res.status(400).json({ success: false, message: "Code, type, and role are required" });
    }

    const roleModelMap = {
      pet_owner: UserModel,
      clinic: ClinicModel,
      vet: VetModel,
      groomer: GroomerModel,
      sitter: SitterModel,
    };

    // Get the model based on the role
    const Model = roleModelMap[role];

    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid role provided" });
    }

    let query = {};
    let updateFields = {};

    if (type === "email") {
      // Query for email verification
      query = {
        verificationToken: code,
        verificationTokenExpiresAt: { $gt: Date.now() },
      };
      updateFields = {
        emailVerified: true,
        verificationToken: undefined,
        verificationTokenExpiresAt: undefined,
      };
    } else if (type === "reset") {
      // Query for password reset verification
      query = {
        resetPasswordToken: code,
        resetPasswordTokenExpiresAt: { $gt: Date.now() },
      };
    } else {
      return res.status(400).json({ success: false, message: "Invalid type. Must be 'email' or 'reset'." });
    }

    // Find the entity based on the query
    const updatedEntity = await Model.findOne(query);

    if (!updatedEntity) {
      return res
        .status(400)
        .json({ success: false, message: `Invalid or expired ${type === "email" ? "email verification" : "password reset"} code` });
    }

    // Apply the update fields if any
    if (Object.keys(updateFields).length > 0) {
      Object.assign(updatedEntity, updateFields);
    }

    // Save the updated entity
    await updatedEntity.save();

    return res.status(200).json({
      success: true,
      message: `${type === "email" ? "Email verified" : "Password reset code verified"} successfully`,
    });
  } catch (error) {
    console.error("Error in VerifyCode:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Forgot Password Function
export const ForgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Define model mappings
    const modelMappings = {
      pet_owner: UserModel,
      clinic: ClinicModel,
      vet: VetModel,
      groomer: GroomerModel,
      sitter: SitterModel,
    };

    const Model = modelMappings[role];
    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid role provided" });
    }

    const user = await Model.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ success: false, message: "Email not verified. Please verify your email." });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetToken;

    // Get the current time in UTC
    const currentTimeUTC = Date.now();
    const timeOffsetInMilliseconds = 5 * 60 * 60 * 1000;
    user.resetPasswordTokenExpiresAt = currentTimeUTC + timeOffsetInMilliseconds + 15 * 60 * 1000;

    await user.save();

    // Send the reset token to the user's email asynchronously
    await sendResetPasswordEmail(user.email, resetToken);

    return res.status(200).json({ success: true, message: "Password reset token sent to your email." });
  } catch (error) {
    console.error("Error in ForgotPassword:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Reset Password Function
export const ResetPassword = async (req, res) => {
  try {
    const { token, newPassword, role } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }
    const modelMappings = {
      pet_owner: UserModel,
      clinic: ClinicModel,
      vet: VetModel,
      groomer: GroomerModel,
      sitter: SitterModel,
    };

    const Model = modelMappings[role];
    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid role provided" });
    }

    const user = await Model.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiresAt: { $gt: Date.now() }, 
    });
    

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = bcryptjs.hashSync(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiresAt = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error in ResetPassword:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Resend Verification Code Function
export const ResendVerificationCode = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const modelMappings = {
      pet_owner: UserModel,
      clinic: ClinicModel,
      vet: VetModel,
      groomer: GroomerModel,
      sitter: SitterModel,
    };

    const Model = modelMappings[role];
    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid role provided" });
    }

    const user = await Model.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ success: false, message: "User is already verified" });
    }
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.verficationToken = verificationToken;
    user.verficationTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // Token valid for 24 hours

    await user.save();

    await sendVerification1Email(user.email, verificationToken);

    return res.status(200).json({
      success: true,
      message: "Verification code resent successfully. Please check your email."
    });
  } catch (error) {
    console.error("Error in ResendVerificationCode:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Resend Reset OTP Function
export const ResendResetOtp = async (req, res) => {
  try {
    const { email, role} = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const modelMappings = {
      pet_owner: UserModel,
      clinic: ClinicModel,
      vet: VetModel,
      groomer: GroomerModel,
      sitter: SitterModel,
    };

    const Model = modelMappings[role];
    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid role provided" });
    }

    const user = await Model.findOne({email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if the reset token has expired or is already used
    if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: "Reset token has expired. Please request a new one." });
    }

    // Regenerate reset OTP if expired or not set
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetOtp;
    user.resetPasswordTokenExpiresAt = Date.now() + 15 * 60 * 1000; // Token valid for 15 minutes

    // Save updated user with new reset OTP
    await user.save();

    // Send reset OTP to email
    await sendResetPasswordEmail(user.email, resetOtp);

    return res.status(200).json({
      success: true,
      message: "Password reset OTP resent successfully. Please check your email."
    });
  } catch (error) {
    console.error("Error in ResendResetOtp:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const sendVerifyEmailOTP = async (user) => {
  try {
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpiresAt = Date.now() + 5 * 60 * 60 * 1000 + 15 * 60 * 1000; // 5 hours + 15 minutes

    // Update the user's verification token and expiration time in the database
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = verificationTokenExpiresAt;
    await user.save();

    // Send the email
    await sendVerification1Email(user.email, verificationToken);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};


// Login Function
export const Login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log("role in login in backend:", role);


    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "Email, password, and role are required" });
    }

    // Define model mappings
    const modelMappings = {
      pet_owner: UserModel,
      clinic: ClinicModel,
      vet: VetModel,
      groomer: GroomerModel,
      sitter: SitterModel,
    };

    // Check if role is valid
    const Model = modelMappings[role];
    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid role provided" });
    }

    // Find user based on role and email
    const user = await Model.findOne({ email });

    if (!user || !bcryptjs.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Check if email is verified for all users
    if (!user.emailVerified) {
      const emailSent = await sendVerifyEmailOTP(user);
      if (emailSent) {
        return res.status(403).json({
          success: false,
          message: "email_not_verified",
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Error sending verification email.",
        });
      }
    }

    if (user.restricted) {
      return res.status(403).json({ success: false, message: "account_restricted" });
    }

    // Check verificationStatus for 'clinic' and other providers
    if (role !== 'pet_owner' && user.verificationStatus !== 'verified') {
      return res.status(401).json({ success: false, message: `Your ${role} account is not verified. You cannot login at the moment.` });
    }

    // Update last login for the user
    user.lastLogin = Date.now();
    await user.save();

    // Create JWT payload
    const payload = { id: user._id, email: user.email, role: role };

    // Sign JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Define role-specific cookie name
    const cookieName = `${role}Token`; // Example: "userToken", "clinicToken", etc.

    // Clear cookies for other roles if they exist
    const otherRoles = ['pet_owner', 'clinic', 'vet', 'groomer', 'sitter'].filter(r => r !== role);
    otherRoles.forEach(r => {
      res.clearCookie(`${r}Token`);
    });

    // Set cookie with the new token
    res.cookie(cookieName, token, {
      httpOnly: true,
      path: "/",
    });

    return res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Error in Login:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const Logout = async (req, res) => {
  try {
    const { role } = req.body;

    // Define model mappings for token cookie names based on roles
    const tokenMappings = {
      admin: "adminToken",
      pet_owner: "pet_ownerToken",
      clinic: "clinicToken",
      vet: "vetToken",
      groomer: "groomerToken",
      sitter: "sitterToken",
    };

    // Check if the role is valid and has a corresponding cookie token
    const cookieName = tokenMappings[role];
    if (!cookieName) {
      return res.status(400).json({ message: `No token found for the specified role: ${role}` });
    }

    // Clear the appropriate cookie for the given role
    res.clearCookie(cookieName, {
      httpOnly: true,
      path: "/",
    });

    return res.status(200).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} logged out successfully` });
  } catch (error) {
    return res.status(500).json({ message: "Failed to log out", error: error.message });
  }
};
