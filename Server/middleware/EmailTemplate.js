// EmailTemplate.js

// Verification email template
export const Verification1_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #fdf5e6;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #f2b300;
          }
          .header {
              background-color: #f57c00;
              color: white;
              padding: 25px;
              text-align: center;
              font-size: 28px;
              font-weight: bold;
              border-bottom: 3px solid #ff6f00;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .verification-code {
              display: block;
              margin: 20px 0;
              font-size: 24px;
              color: #ff6f00;
              background: #fff3e0;
              border: 1px dashed #f57c00;
              padding: 15px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #fdf5e6;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #f2b300;
          }
          p {
              margin: 0 0 15px;
          }
          a {
              color: #f57c00;
              text-decoration: none;
              font-weight: bold;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Verify Your Email</div>
          <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up with us! To complete your registration, please confirm your email address by entering the code below:</p>
              <span class="verification-code">{verificationCode}</span>
              <p>If you did not sign up, no further action is required. Feel free to <a href="mailto:support@yourcompany.com">contact our support team</a> if you have any questions.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;

export const Verification_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #fdf5e6;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #f2b300;
          }
          .header {
              background-color: #f57c00;
              color: white;
              padding: 25px;
              text-align: center;
              font-size: 28px;
              font-weight: bold;
              border-bottom: 3px solid #ff6f00;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .verification-code {
              display: block;
              margin: 20px 0;
              font-size: 24px;
              color: #ff6f00;
              background: #fff3e0;
              border: 1px dashed #f57c00;
              padding: 15px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #fdf5e6;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #f2b300;
          }
          p {
              margin: 0 0 15px;
          }
          a {
              color: #f57c00;
              text-decoration: none;
              font-weight: bold;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Verify Your Email</div>
          <div class="content">
              <p>Hello,</p>
              <p>We received a request to change your profile information. Please confirm your email address by entering the code below:</p>
              <span class="verification-code">{verificationCode}</span>
              <p>If you did not initiate this action then, no further action is required. Feel free to <a href="mailto:support@yourcompany.com">contact our support team</a> if you have any questions.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;

export const VerificationStatus_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Verification Status Update</title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #fdf5e6;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #f2b300;
          }
          .header {
              background-color: #f57c00;
              color: white;
              padding: 25px;
              text-align: center;
              font-size: 28px;
              font-weight: bold;
              border-bottom: 3px solid #ff6f00;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .status-message {
              display: block;
              margin: 20px 0;
              font-size: 24px;
              color: #ff6f00;
              background: #fff3e0;
              border: 1px dashed #f57c00;
              padding: 15px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #fdf5e6;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #f2b300;
          }
          p {
              margin: 0 0 15px;
          }
          a {
              color: #f57c00;
              text-decoration: none;
              font-weight: bold;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Your Verification Status Update</div>
          <div class="content">
              <p>Hello,</p>
              <p>We wanted to inform you that your verification status has been updated by our administrator:</p>
              <span class="status-message">{statusMessage}</span>
              <p>{actionDetails}</p>
              <p>If you have any questions or concerns, feel free to <a href="mailto:support@yourcompany.com">contact our support team</a>.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;

export const ProviderVerificationStatus_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Status Update</title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #fdf5e6;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #f2b300;
          }
          .header {
              background-color: #f57c00;
              color: white;
              padding: 25px;
              text-align: center;
              font-size: 28px;
              font-weight: bold;
              border-bottom: 3px solid #ff6f00;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .status-message {
              display: block;
              margin: 20px 0;
              font-size: 24px;
              color: #ff6f00;
              background: #fff3e0;
              border: 1px dashed #f57c00;
              padding: 15px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #fdf5e6;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #f2b300;
          }
          p {
              margin: 0 0 15px;
          }
          a {
              color: #f57c00;
              text-decoration: none;
              font-weight: bold;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Verification Status Update</div>
          <div class="content">
              <p>Hello,</p>
              <p>Your verification status has been updated. You are now {status} as a {type}.</p>
              <span class="status-message">{status === 'verified' ? 'Congratulations, you have been approved!' : 'Unfortunately, your application has been rejected.'}</span>
              <p>If you have any questions, feel free to <a href="mailto:support@yourcompany.com">contact our support team</a>.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;

// Reset password email template
export const Reset_Password_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #fdf5e6;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #f2b300;
          }
          .header {
              background-color: #f57c00;
              color: white;
              padding: 25px;
              text-align: center;
              font-size: 28px;
              font-weight: bold;
              border-bottom: 3px solid #ff6f00;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .reset-code {
              display: block;
              margin: 20px 0;
              font-size: 24px;
              color: #ff6f00;
              background: #fff3e0;
              border: 1px dashed #f57c00;
              padding: 15px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #fdf5e6;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #f2b300;
          }
          p {
              margin: 0 0 15px;
          }
          a {
              color: #f57c00;
              text-decoration: none;
              font-weight: bold;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Password Reset Request</div>
          <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password. Please use the code below to reset your password:</p>
              <span class="reset-code">{resetCode}</span>
              <p>If you did not request a password reset, no further action is required. If you have any questions, feel free to <a href="mailto:support@yourcompany.com">contact our support team</a>.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;

// Acceptance email
export const Acceptance_Email_Template = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { font-family: Arial; background:#fdfdfd; }
  .header { background:#10b981; color:#fff; padding:20px; text-align:center; }
  .content { padding:20px; }
  .footer { font-size:12px; color:#888; text-align:center; padding:10px; }
  .next-steps { background:#ecfdf5; border:1px solid #10b981; padding:15px; margin:20px 0; }
</style></head><body>
  <div class="header">Congratulations!</div>
  <div class="content">
    <p>Hello,</p>
    <p>Your adoption application for <strong>{petTitle}</strong> has been <span style="color:#10b981;font-weight:bold;">accepted</span>!</p>
    <div class="next-steps">
      <p><strong>Next Steps:</strong></p>
      <p>{nextSteps}</p>
    </div>
    <p>Thank you for using our service.</p>
  </div>
  <div class="footer">&copy; ${new Date().getFullYear()} PetConnect</div>
</body></html>
`;

// Rejection email
export const Rejection_Email_Template = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { font-family: Arial; background:#fef2f2; }
  .header { background:#ef4444; color:#fff; padding:20px; text-align:center; }
  .content { padding:20px; }
  .reason { background:#fee2e2; border:1px solid #ef4444; padding:15px; margin:20px 0; }
  .footer { font-size:12px; color:#888; text-align:center; padding:10px; }
</style></head><body>
  <div class="header">Application Update</div>
  <div class="content">
    <p>Hello,</p>
    <p>We’re sorry to inform you that your application for <strong>{petTitle}</strong> was <span style="color:#ef4444;font-weight:bold;">not selected</span>.</p>
    <div class="reason">
      <p><strong>Reason:</strong></p>
      <p>{reason}</p>
    </div>
    <p>Feel free to browse other pets available for adoption.</p>
  </div>
  <div class="footer">&copy; ${new Date().getFullYear()} PetConnect</div>
</body></html>
`;
