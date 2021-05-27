const express   =   require('express');
const router    =   express.Router('');
const Profile   =   require('../../models/Profile');
const User      =   require('../../models/User');
const auth      =   require('../../middleware/auth');
const { check, validationResult }    =   require('express-validator/check');

//@Ruta     GET /api/profile/me
//@Opis     Dobavljanje trenutnog profila   
//@Pristup  Private     

router.get('/me', auth, async (req,res) => {
   
    try {
        const currentProfile = await Profile.findOne({ user: req.user.id }).populate('user',['name','avatar']);
        if(!currentProfile)
        {
          return res.status(400).json({msg:'Profil ne postoji!'});
        }

        res.json(currentProfile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Serverska greska!');
    }
});



router.post('/', auth, [
    check('status', 'Ovo polje ne smije biti prazno!').not().isEmpty(),
    check('skills','Ovo polje ne smije biti prazno!').not().isEmpty()
]  , async (req,res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()});
    }

    const
    {
        company,
        website,
        location,
        status,
        skills,
        bio,
        githubUsername,
        date,
        youtube,
        instagram,
        facebook,
        twitter,
        linkedin,

    } = req.body;

    let profileFields = {};
    profileFields.user  =   req.user.id;
    if(company) profileFields.company    =   company;
    if(website) profileFields.website    =   website;
    if(location) profileFields.location  =   location;
    if(status)  profileFields.status     =   status;
    if(skills)  profileFields.skills     =   skills.split(',').map(skill => skill.trim());
    if(bio)     profileFields.bio        =   bio;
    if(githubUsername) profileFields.githubUsername  =   githubUsername;
    if(date)    profileFields.date       =   date;

    profileFields.social = {};
    if(youtube) profileFields.social.youtube     =   youtube;
    if(instagram) profileFields.social.instagram =   instagram;
    if(facebook) profileFields.social.facebook   =   facebook;
    if(twitter) profileFields.social.twitter     =   twitter;
    if(linkedin) profileFields.social.linkedin   =   linkedin;

    try {
        let profile = await Profile.findOne({ user:req.user.id });
        
        //UPDATE
        if(profile)
        {
            profile = await Profile.findOneAndUpdate({user: req.user.id},{$set: profileFields},{new: true});
            return res.json(profile);
        }

        //CREATE
        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile);

    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Serverska greska!')
    }

});


module.exports=router;