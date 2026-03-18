var express=require('express'),router=express.Router();
router.post('/login',function(req,res){try{var e=(req.body&&req.body.email)?String(req.body.email).trim():'';if(!e)return res.status(400).json({ok:false,error:'email required'});res.json({ok:true,message:'Login stub'});}catch(err){res.status(500).json({ok:false,error:'server error'});}});
router.post('/signup',function(req,res){try{var e=(req.body&&req.body.email)?String(req.body.email).trim():'';if(!e)return res.status(400).json({ok:false,error:'email required'});res.json({ok:true,message:'Signup stub'});}catch(err){res.status(500).json({ok:false,error:'server error'});}});
module.exports=router;
