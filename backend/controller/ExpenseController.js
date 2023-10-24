const Razorpay = require("razorpay");
const expenseModel = require("../models/expenseModel");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const urlModel = require("../models/urlModel");

const dotenv = require("dotenv");
// const { TokenExpiredError } = require("jsonwebtoken");
const sequelize = require("../util/database");
dotenv.config(); // Load the .env file
const AWS = require('aws-sdk');


/*******************************************************/
//  GET DOWNLOAD-Expense File
/*******************************************************/
  //helper function to upload to s3 bucket
  function uploadTos3(data, filename){
    const Bucket_Name = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    //bucket instance
    let s3Bucket = new AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET,
      // Bucket: Bucket_Name,
    })

      var params = {
        Bucket: Bucket_Name,
        Key: filename,
        Body: data,
        // ACL: 'public-read'
      }

      return new Promise((resolve, reject) => {
      s3Bucket.upload(params, (err, s3response)=> {
        if(err){
          console.log("something  went wrong", err);
          reject(err);
        } else {
          console.log("success", s3response)
          resolve(s3response.Location);
        }
      })
      })
  }

  exports.downloadExpenses = async (req, res) => {
    try {
    console.log("inside download backend");
    console.log(req.user.id);
    const userid = req.user.id;
    const expenses = await expenseModel.findAll({
      where: {userId: userid}
    });
    // const expenses = await UserServices.getExpenses(req, userid);
    console.log(expenses);

    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expenses${userid}/${new Date()}.txt`;
    //function call
    const fileURL = await uploadTos3(stringifiedExpenses, filename);
    console.log(fileURL);
    await urlModel.create({
      url: fileURL,
      userId: userid
    })
    res.status(200).json({fileURL, success: true, message: "File downloaded!"})
  } catch(err) {
    res.status(500).json({fileURL: '', success: false, err: err})
  }
}

/*******************************************************/
//  GET DOWNLOAD-Expense File Urls
/*******************************************************/
exports.getUrls = async (req, res) => {
  try{
    const urls = await urlModel.findAll({
      where: {userId: req.user.id}
    })
    res.status(200).json({urls, success: true})
  }catch(err) {
    res.status(404).send('Data not found');
  }
}

/*******************************************************/
//  POST Add-Expense Controller
/*******************************************************/
exports.postAddExpense = async (req, res, next) => {
  //to abort a transaction if any error at any step
  const t = await sequelize.transaction(); // Start a transaction
  try {
    console.log("inside add backend");
    const amount = req.body.amount;
    const description = req.body.description;
    const category = req.body.category;
    const id = req.user.id;

    const user = await userModel.findOne({
      where: { id: id }},
     { transaction: t // Pass the transaction object here
    });

    const totExp = user.totalexpenses + Number(amount);
    console.log(totExp);

    await userModel.update(
      { totalexpenses: totExp },
      { where: { id: id }}, 
      {transaction: t } // Pass the transaction object here
    );
    
    console.log("after total expense");
    
    const data = await expenseModel.create(
      {
        amount: amount,
        description: description,
        category: category,
        userId: id,
      },
       {transaction: t }, // Pass the transaction object here
    );

    await t.commit(); // Commit the transaction
    res.status(201).json({ newExpenseDetail: data });
  } catch (err) {
    res.status(500).json(err);
  }
};

/*******************************************************/
//  GET Expense Controller
/*******************************************************/
exports.getExpense = async (req, res, next) => {
  try {
    console.log("inside get exp back");
    const userId = req.user.id;
    console.log(userId);

    //fetching details of each expense of a user
    const expenses = await expenseModel.findAll({
      where: { userId: userId },
      // attributes: ['id', 'amount', 'description', 'category'],
    });

    //fetching total expenses of that user
    const totalExpense = await userModel.findOne({
      where: {id: userId},
      attributes: ['totalexpenses']
    });

    //fetching top 3 users by expense
    const topUsers = await userModel.findAll({
      order: [['totalexpenses', 'DESC']],
      attributes: ['name','totalexpenses'],
      limit: 3,
    });
    
    res.status(200).json({ expensesDetails: expenses, totalExpense: totalExpense, topUsers: topUsers});
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

/*******************************************************/
//  GET Single User Details Controller
/*******************************************************/
exports.getUserDetails = async (req, res, next) => {
  try {
    console.log("inside get orders backend");
    console.log(req.user.id);
    const user = await userModel.findAll({
      where: { id: req.user.id },
    });

    // console.log(user);
    res.status(200).json({ users: user });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

/*******************************************************/
// Delete Expense Controller
/*******************************************************/
exports.postDeleteExpense = async (req, res, next) => {
  const t = await sequelize.transaction(); // Start a transaction

  try {
    console.log("inside post delete backend");
    const expenseId = req.params.expenseId;
    const userId = req.user.id;

    // Fetching expense
    const expense = await expenseModel.findOne({
      where: { id: expenseId },
      transaction: t, // Pass the transaction object here
    });

    // Fetching user
    const user = await userModel.findOne({
      where: { id: userId },
      transaction: t, // Pass the transaction object here
    });

    console.log("user amount: " + user.totalexpenses);

    const updatedAmount = user.totalexpenses - expense.amount;
    console.log("updated amount: " + updatedAmount);

    // Update the user's totalexpenses
    await userModel.update(
      { totalexpenses: updatedAmount },
      { where: { id: userId }, transaction: t }
    );

    // Destroy the expense
    await expense.destroy({ transaction: t });

    await t.commit(); // Commit the transaction
    res.status(200).send("deleted successfully");
  } catch (err) {
    await t.rollback(); // Rollback the transaction in case of an error
    console.error(err);
    res.status(500).json({ error: err });
  }
};

/*******************************************************/
// Edit Expense Controller
/*******************************************************/
exports.postEditExpense = (req, res, next) => {
  console.log("inside post editer backend");
  const expenseId = req.params.expenseId;
  const amount = req.body.amount;
  const description = req.body.discription;
  const category = req.body.category;

  expenseModel
    .update(
      {
        amount: amount,
        description: description,
        category: category,
      },
      { where: { id: expenseId } }
    )
    .then((user) => {
      console.log("consoled updated succesfully");
      res.send("updated successfully");
    })
    .catch((err) => console.log(err.message));
};

/*******************************************************/
//  GET Premium Controller
/*******************************************************/
exports.getPurchasePremium = async (req, res) => {
  // console.log("inside razor backend");
  // console.log(process.env.RAZORPAY_KEY_ID);
  // console.log(process.env.RAZORPAY_KEY_SECRET);
  try {
    //  Initialize Razorpay with  API key_id and key_secret
    let rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const amount = 100;
    // if successfull then Razorpay creates an "order"
    rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
      if (err) {
        throw new Error(JSON.stringify(err));
      }

      try {
        //
        /*await req.user.createOrderModel({ orderid: order.id, status: "PENDING" });
         return res.status(201).json({ order, key_id: rzp.key_id });*/
        // If successful, create a new order in the database using Sequelize's create method.
        const createdOrder = await orderModel.create({
          orderid: order.id,
          status: "PENDING",
          userId: req.user.id,
        });
        //It sends a JSON response to the frontend containing the order details and Razorpay key.
        return res.status(201).json({ order: createdOrder, key_id: rzp.key_id });
      } catch (err) {
        throw new Error(err);
      }
    });
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: "Something went wrong", error: err.message });
  }
};

/*******************************************************/
//  Update Transaction Status Controller
/*******************************************************/
exports.postUpdateTransactionStatus = async (req, res) => {
  try {
    console.log("inside update premium backend");
    const { payment_id, order_id } = req.body;
    console.log(req.user.dataValues.id);

    // Use async/await for cleaner and more readable code
    const order = await orderModel.findOne({ where: { orderid: order_id } });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Update the specific order record
    const updateData = {
      paymentid: payment_id,
      status: "SUCCESSFUL",
    };
    await orderModel.update(updateData, {
      where: {
        orderid: order_id, // Specify the condition for the update
      },
    });
    // Update the specific order record
    const updateUser = {
      ispremiumuser: true,
    };
    await userModel.update(updateUser, {
      where: {
        id: req.user.dataValues.id, // Specify the condition for the update
      },
    });

    // Update the user record to indicate premium status
    // await req.user.update({ ispremiumuser: true });

    return res.status(202).json({ success: true, message: "Transaction Successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
