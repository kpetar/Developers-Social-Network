const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req,res,next){
    //Uzeti token iz header-a
    const token = req.header('x-auth-token');

    //Da li postoji token
    if(!token)
    {
        return res.status(401).json({msg:'Token nije pronadjen, proces autorizacije odbijen!'});
    }

    //Verifikacija tokena
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user;
        next();
    } catch (error) {
        console.error(error.message);
        res.status(401).json({msg:'Token nije validan!'});
    }
}