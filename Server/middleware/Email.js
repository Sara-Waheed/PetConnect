import { transporter } from "./Email.config.js";
import { Verification1_Email_Template, VerificationStatus_Email_Template,  Reset_Password_Email_Template,
  ProviderVerificationStatus_Email_Template, Verification_Email_Template, Acceptance_Email_Template, 
  Rejection_Email_Template  } from "./EmailTemplate.js";
import dotenv from "dotenv";

dotenv.config();

// Function to send verification email
export const sendVerification1Email = async (email, verificationCode) => {
  try {
    const response = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email, // list of receivers
      subject: "Verify your Email", // Subject line
      text: "Please Verify your Email", // plain text body
      html: Verification1_Email_Template.replace("{verificationCode}", verificationCode), // Replace placeholder with verification code
    });
    console.log('Verification email sent successfully', response);
  } catch (error) {
    console.log('Error sending verification email', error);
  }
};

export const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const response = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email, // list of receivers
      subject: "Verify your Email", // Subject line
      text: "Please Verify your Email", // plain text body
      html: Verification_Email_Template.replace("{verificationCode}", verificationCode), // Replace placeholder with verification code
    });
    console.log('Verification email sent successfully', response);
  } catch (error) {
    console.log('Error sending verification email', error);
  }
};

// Function to send reset password email
export const sendResetPasswordEmail = async (email, resetCode) => {
  try {
    const response = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email, // list of receivers
      subject: "Password Reset Request", // Subject line
      text: "We received a request to reset your password. Use the code below to reset it.", // plain text body
      html: Reset_Password_Email_Template.replace("{resetCode}", resetCode), // Replace placeholder with reset code
    });
    console.log('Password reset email sent successfully', response);
  } catch (error) {
    console.log('Error sending password reset email', error);
  }
};

export const sendVerificationStatusEmail = async (email, status, entityType) => {
  try {
    // Determine the status message and action details based on the status and entity type
    let statusMessage = '';
    let actionDetails = '';

    if (status === 'verified') {
      statusMessage = `Your application as ${entityType.charAt(0).toUpperCase() + entityType.slice(1)} has been approved`;
      actionDetails = `You can now start offering your services. If you need assistance, feel free to contact us.`;
    } else if (status === 'rejected') {
      statusMessage = `Your application as ${entityType.charAt(0).toUpperCase() + entityType.slice(1)} has been rejected`;
      actionDetails = `Unfortunately, your application has not been approved. Please contact support for more details.`;
    }

    // Send email using transporter
    const response = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email, // List of receivers
      subject: `Your ${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Verification Status`, // Subject line
      text: `Your ${entityType} verification status has been updated. ${statusMessage}`, // Plain text body
      html: VerificationStatus_Email_Template
        .replace("{statusMessage}", statusMessage) // Replace status message placeholder
        .replace("{actionDetails}", actionDetails), // Replace action details placeholder
    });

    console.log('Verification status email sent successfully', response);
  } catch (error) {
    console.log('Error sending verification status email', error);
  }
};

export const sendProviderVerificationStatusEmail = async (email, status, type) => {
  try {
    const response = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email, // list of receivers
      subject: 'Your Verification Status Update', // Subject line
      html: ProviderVerificationStatus_Email_Template.replace("{status}", status).replace("{type}", type), // Replace placeholder with status and type
    });
    console.log('Verification status email sent successfully', response);
  } catch (error) {
    console.log('Error sending verification status email', error);
  }
};


/**
 * Send acceptance email when an application is accepted
 */
export const sendAcceptanceEmail = async (email, { petTitle, nextSteps }) => {
  try {
    const html = Acceptance_Email_Template
      .replace("{petTitle}", petTitle)
      .replace("{nextSteps}", nextSteps);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your adoption application for "${petTitle}" was accepted!`,
      html,
    });
    console.log("Acceptance email sent to", email);
  } catch (err) {
    console.error("Error sending acceptance email:", err);
  }
};

/**
 * Send rejection email when an application is rejected
 */
export const sendRejectionEmail = async (email, { petTitle, reason }) => {
  try {
    const html = Rejection_Email_Template
      .replace("{petTitle}", petTitle)
      .replace("{reason}", reason);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your adoption application for "${petTitle}"`,
      html,
    });
    console.log("Rejection email sent to", email);
  } catch (err) {
    console.error("Error sending rejection email:", err);
  }
};
