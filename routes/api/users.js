const express   =   require('express');
const router    =   express.Router('');
const User      =   require('../../models/User');
const gravatar  =   require('gravatar');
const bcrypt    =   require('bcrypt');
const jwt       =   require('jsonwebtoken');
const config    =   require('config');

const { check, validationResult }    =   require('express-validator/check');

router.post('/',[
    check('name','Polje ne smije biti prazno!').not().notEmpty(),
    check('email','Molimo Vas unesite ispravan Email').isEmail(),
    check('password','Lozinka mora biti duza od 6 karaktera').isLength({min:6})
], async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()});
    }

    //Da li korisnik vec postoji?
    const { name, email, password } =   req.body;

    try
    {
        let user  =   await User.findOne({
            email
        });
    
        if(user)
        {
            return res.status(400).json({error:[{msg:'Korisnik vec postoji'}]});
        }

        const avatar = gravatar.url(email, {
            s:'200',
            r:'pg',
            d:'mm'
        });

        user = new User({
            name,
            email,
            password,
            avatar
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

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
        }
        )
    }
    catch(error)
    {
        console.error(error.message);
        res.status(500).send('Greska servera..');
    }
    
    
    });


module.exports=router;