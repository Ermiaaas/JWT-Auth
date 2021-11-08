const UserRouter = require("express").Router();
const db = require("../config/database/db_connection.js");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { response } = require("express");
const saltRounds = 10
const knex = require("knex")


const verifyTokenMiddleware = async function (req, res, next) {
    const token = req.headers.authorization
    if (!token) return res.status(401).json({ msg: "no Token" });
    try {
      const userId = await jwt.verify(token, process.env.SECRET)
      console.log(userId)
        const user = await db('user').select("*")
        .where({
            id: userId,
        })
        req.user = user
      next();
    } catch (err) {
        console.log(err)
        res.status(400).json({ msg: "invalid Token" });
    }
};

UserRouter.post("/users", async(req, res, next) => {
    const {username,password_digest} = req.body
    let salt = await bcrypt.genSalt(saltRounds)
    let hashedPassword = await bcrypt.hash(password_digest, salt)
    return await db('user').insert({
        username: username,
        password_digest: hashedPassword
    })
    .then(users => {
        res.json(users)
    })
    .catch(err => console.log(err))
});

UserRouter.get("/users", (req, res, next) => {
    db('user').then(users => {
        res.json(users)
    })
});

UserRouter.post("/login", (req, res, next) => {
    const {username,password_digest} = req.body;
    db('user')
    .where({username: username})
    .first()
    .then(user => {
        if(!user){
            res.status(401).json({
                error: "No user by that name!"
            })
        } else {
            return bcrypt.compare(password_digest, user.password_digest)
            .then( async (isAuthenticated) => {
                if(!isAuthenticated){
                    res.status(401).json({
                        error: "Unauthorized Access!"
                    })
                } else {
                    const token = await jwt.sign(user.id, process.env.SECRET)
                        res.status(200).json({token})
                };
            });
        };
    });
});

UserRouter.get("/verify", verifyTokenMiddleware, (req, res, next) => {
    res.send(req.user)
});

module.exports = (UserRouter);