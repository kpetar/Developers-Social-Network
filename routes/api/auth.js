const express   =   require('express');
const router    =   express.Router('');
const auth      =   require('../../middleware/auth');
const User = require('../../models/User');

const bcrypt    =   require('bcrypt');
const jwt       =   require('jsonwebtoken');
const config    =   require('config');

const { check, validationResult }    =   require('express-validator/check');

router.get('/', auth, async (req,res)=>{
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Serverska greska..');
    }
});

router.post('/',[
    check('email','Molimo Vas unesite ispravan Email').isEmail(),
    check('password','Molimo Vas unesite ispravnu Lozinku').exists()
], async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()});
    }

    //Da li korisnik vec postoji?
    const { email, password } =   req.body;

    try
    {
        let user  =   await User.findOne({
            email
        });
    
        if(!user)
        {
            return res.status(400).json({error:[{msg:'Korisnik ne postoji!'}]});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch)
        {
            return res.status(400).json({error:[{msg:'Korisnik ne postoji!'}]})
        }

        const payload = {
            user:{
                id:user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'),
        {expiresIn:36000},
        (err,token)=>{
            if(err) throw err;
            res.json({token});
        });


    }
    catch(error)
    {
        console.error(error.message);
        res.status(500).send('Greska servera..');
    }
    
    
    });


module.exports=router;