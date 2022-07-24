const nodemailer = require("nodemailer");

const sendEmail = async (email, username, data, type, req) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "httt2hauik15@gmail.com",
      pass: "avhwerjghrgdocgy",
    },
  });

  let text = "";
  const resetURL = `${req.protocol}://${req.get("host")}`;
  if (type == "register") {
    text = `Please click: ${resetURL}/api/auth/register?username=${username}&code=${data}`;
  } else if (type == "forgot-password") {
    text = `Mã OTP ${data}`;
  }

  const mailOptions = {
    from: "HT Chill",
    to: email,
    subject: "Verify HT Chill account registration",
    text: text,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = {
  sendEmail,
};
