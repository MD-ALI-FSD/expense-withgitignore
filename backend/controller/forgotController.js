const forgotpassModel = require("../models/forgotpassModel");
const path = require('path');
const bcrypt = require("bcrypt");
// const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const sequelize = require("../util/database");
const { CLIENT_RENEG_LIMIT } = require("tls");


/*********************************************************/
//send HTML file to update password
/*********************************************************/
exports.postVerifyLink = async (req, res, next) => {
  try {
    console.log("inside verify html");
    console.log(req.params.uniqueId);
    
      const htmlFilePath = path.join(__dirname, '../../frontend', 'updatePassword.html');
    res.sendFile(htmlFilePath);
  } catch (error) {
    console.error(error);
  }
};

/*********************************************************/
//create New Password
/*********************************************************/
exports.PostCreateNewPassword = async (req, res, next) => {
  console.log("inside update password");
  // console.log("Request URL: " + req.originalUrl);
  const { pass, confirmPass , linkId} = req.body;
  const  idd  = linkId;
  // const idd = unique;
  console.log("idd: " + idd);

    //matching both passwords
  if (pass !== confirmPass)
    return res
      .status(400)
      .json({ success: false, message: "MisMatched Passwords!" });
  
  //fetching data from forgotPassword Table
  const t = await sequelize.transaction();
  try {
    const FPM = await forgotpassModel.findOne(
      { where: { id: idd } },
      { transaction: t }
    );
    
    //if link is not active
    if (!FPM.isactive) {
      await t.commit();
      return res.status(400).json({
        success: false,
        message: "Link Expired! Go back and generate a New Link",
      });
    }

    //else encrypting the password
    const hashedPassword = bcrypt.hashSync(pass, 10);
   
    //making link inactive
    const updatedFPM = forgotpassModel.update(
      { isactive: false },
      { where: { id: idd } },
      { transaction: t }
    );
    
    //updating password
    const updatedUser = userModel.update(
      { password: hashedPassword },
      { where: { id: FPM.userid } },
      { transaction: t }
    );

    await Promise.all([updatedFPM, updatedUser]);
    await t.commit();
    res
      .status(200)
      .json({ success: true, message: "Password Updated Successfully" });
  } catch (error) {
    t.rollback();
    console.log(error);
  }
};