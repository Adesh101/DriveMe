var express=require('express');
var router=express.Router();
var passport=require('passport');
var LocalStrategy=require('passport-local').Strategy;
const {MongoClient,ObjectID}=require('mongodb');
var User=require('../models/user');
var RequestSchema=require('../models/request');
var GivenSchema=require('../models/given');
var TakenSchema=require('../models/taken');
var arr=[];
var arr1=[];
const url='mongodb://localhost/shareyourride';

var io = require('socket.io')(4800);

const accessToken='pk.eyJ1IjoiZGFya3JhaTE5IiwiYSI6ImNqcHdvOTBnYTBoamg0NHFscjY4MWM5d2cifQ.TTBp3QZuSBuXKzCmsCN7MA';
var id;
var data;
var local;
var req_validation=0;
var requester_id;
io.on('connection', function (socket) {
  
    socket.on('findRequests',function(data)
    {
        console.log(data);
        console.log('Entered in findRequests');
        findRequests();
        /* */
    });
    socket.on('acceptedBy',function(data)
    {
        console.log(data);
        console.log("socket id:"+socket.id);
        console.log('Entered in acceptedBy'+data);
        //findRequests();
       
        getData(data).then(function(data)
        {
            io.emit('displayAccepted',data);
        });
        /* */
    });
    socket.on('enablechat',function(data)
    {
        MongoClient.connect(url,function(err,client)
        {
            var db=client.db('shareyourride');
            if(err)
            {
                console.log('something went wrong');
            }
            else{
                db.collection('users').updateOne(
                    {"id":new ObjectID(data)},
                    {$set:{chatstatus:1}},
                    function(){
                           
                           // io.emit('output',[data]);
                            console.log("success chatstatus");
                            //Send status obj
                            
                });
            }
        });
        /* */
    });
    socket.on('enableChat',function(data)
    {
        console.log("chat+"+data);
        MongoClient.connect(url,function(err,client)
        {
            var db=client.db('shareyourride');
            console.log('working');
            try
            {
                db.collection('users').updateOne(
                    {"_id":new ObjectID(data)},
                    {$set:{chatstatus:1}}).catch((e)=>{
                        console.log(e);
                    });

                db.collection('users').findOne({"_id":new ObjectID(data)}).then((docs)=>{
                    socket.emit("chatActivated",docs.chatstatus);
                });
            }
            catch(e)
            {
                console.log(e);
            }
            
        });
    }); 
   
    
});
function findRequests()
     {
        MongoClient.connect(url,function(err,client)
        {
            var db=client.db('shareyourride');
            db.collection('requestschemas').find({reqstatus:{$lt:2}}).forEach(function(myDoc){
                arr.push(myDoc);
                
            }).then(()=>{
                console.log(arr[0]);
                console.log('Then success');
                //res.render('give',{arr});
                arr1=arr.slice();
                io.emit('resultRequests', {arr1});
                arr1.length=0;
                arr.length=0;
            });
        });
     }
function checkReq(user_id)
{
    return new Promise(function(resolve,reject)
    {
    MongoClient.connect(url,function(err,client)
        {
        var db=client.db('shareyourride');
        console.log('working');
        if(err)
        {
            //socket.emit('output',0);
            console.log('error in socket:');
        }
        else
        {
                
                db.collection('requestschemas').findOne({"id":new ObjectID(user_id)}).then((docs)=>{
                //console.log(docs);
                if(docs==null)
                {
                  console.log("zero");
                  //io.emit('output',docs);
                  resolve(docs);
                }
                else
                {
                    //io.emit('output',docs);
                        console.log("checkreq:"+docs.name);
                        resolve(docs);
                }
                });
        }
        });
    });
}
router.get('/register',nocache,ensureAuthenticated,function(req,res){
    res.render('register');
});
router.get('/login',nocache,ensureAuthenticated,function(req,res){
    res.render('login');
});
router.get('/select',nocache,ensureAuthenticated1,function(req,res){
   
    res.render('select');
});

router.get('/request',nocache,ensureAuthenticated1,function(req,res){
  
    checkReq(req.user._id).then(function(data)
    {
        if(data==null)
        {
            var info={
                reqstatus:0
            };
            res.render('request',{info});
        }
        else
        {
            info=data;
            console.log('Information'+info.name);
            res.render('request',{info});
        }
        
       
       
      
    });
   
});
router.get('/give',nocache,ensureAuthenticated1,function(req,res){
    res.render('give');
});
/*router.get('/confirmride',nocache,ensureAuthenticated1,function(req,res){
     checkReq(req.body.req_id).then(function(data)
    {
        
            var local=data;
            
            res.render('confirmride',{local});
        
       
       
      
    });
});*/
router.post('/confirmride',function(req,res){
    //requester_id=req.body.req_id;
    //console.log(arr[0]);
   /* console.log("confirmride:"+req.body.req_id);
    for(i=0;i<arr.length;i++)
    {
        if(arr[i].id==req.body.req_id)
        {
            console.log("user's request is exist");
            local=arr[i];
            break;
        }
    }
    console.log(local);
    //console.log('entered in confirmride post:requester id'+requester_id);*/
    checkReq(req.body.req_id).then(function(data)
    {
        
            var local=data;
            
            res.render('confirmride',{local});
        
       
       
      
    });
    //res.redirect('/users/confirmride');
});
router.get('/account',nocache,ensureAuthenticated1,function(req,res){
  
    let info;
    getData(req.user._id).then(function(data)
    {
        info=data;
        res.render('account',data);
    });
});
function getData(x)
{
    return new Promise(function(resolve,reject)
    {
        MongoClient.connect(url,function(err,client){
            var db=client.db('shareyourride');
            if(err)
            {
                console.log('something went wrong');
            }
            else{
                console.log('connected successfully');
                db.collection('users').findOne({_id:new ObjectID(x)}).then((docs)=>{
                    data=Object.assign(docs);
                    //console.log(JSON.stringify(docs, undefined, 2));
                    console.log('Entered in getData'+data.name);
                    resolve(data);             
                    //res.render('account',data);
                   
                },(err)=>{
                    console.log('Unable to fetch todos',err)   
                });
           
            }
            
        });
    });
}
function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated())
    {
        req.flash('error_msg','Your are already logged in');
        res.redirect('/');
    }
    else{
        
        return next();
    }
}
function ensureAuthenticated1(req,res,next){
    if(req.isAuthenticated())
    {
        return next();
    }
    else{
        req.flash('error_msg','Your are not logged in');
        res.redirect('/users/login');
    }
}
function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
  }
router.post('/register',function(req,res){
    console.log("succeed");
    var enroll=req.body.enroll;
    var name=req.body.name;
    var mobile=req.body.mobile;
    var email=req.body.email;
    var password=req.body.password;
    var vehicle=req.body.vehicle;
    var gender=req.body.gender;
    //validation
    //console.log(enroll+''+name+''+mobile+''+email+''+password+''+vehicle+''+gender);
    req.checkBody('email','Email is not valid').isEmail();
    var errors=req.validationErrors();
    if(errors)
    {
        res.render('register',{
            errors:errors
        });
    }
    else{
       
        var newUser=new User({
            enrollment:enroll,
            name:name,
            mobile:mobile,
            email:email,
            password:password,
            vehicle:vehicle,
            gender:gender
        });
        //console.log(newUser);
        User.createUser(newUser,function(err,user){
            if(err)
            {
                req.flash('error_msg','Please enter correct details');
                res.redirect('/users/register');
            }
            else
            {
                req.flash('success_msg','Your are registered and can now login');
                res.redirect('/users/login');
            } 
            //console.log(user);
        });


    }
});
passport.use(new LocalStrategy(
    function(username, password, done) {
        //console.log('hello');
     User.getUserByUsername(username,function(err,user){
        // console.log('inside getuserbyname');
        if(err) throw err;

        if(!user)
        {
            return done(null,false,{message:'Unknown User'});
        }
        User.comparePassword(password,user.password,function(err,isMatch){
            if(err) throw err;
            if(isMatch)
            {
                return done(null,user);
            }
            else{
                return done(null,false,{message:'Invalid password'});
            }
        });
     }); 
    }));
passport.serializeUser(function(user, done) {
    console.log('inside serial');
    id=user.id;
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
   console.log('inside deserial');
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });
  router.post('/login',
   passport.authenticate('local',{successRedirect:'/users/select',failureRedirect:'/users/login',failureFlash:true}),
   function(req, res) {
     res.redirect('/');
   });
  router.post('/confirm',nocache,ensureAuthenticated1,function(req,res)
{
    var id=req.user._id;
    var name;
    var longitude=req.body.long;
    var latitude=req.body.lat;
    var pickuplocation=req.body.pickup;
    var time=req.body.time;
   
   console.log("id in confirm:"+id);
    getData(req.user._id).then(function(data)
    {
        name=data.name;
        var newRequest=new RequestSchema({
            id:id,
            name:name,
            longitude:longitude,
            latitude:latitude,
            pickuplocation:pickuplocation,
            time:time,
        });
        newRequest.save(function(err)
   {
       if(err)
       {
           console.log(err);
        req.flash('error_msg','Your request is already exist');
        res.redirect('/users/request');
       }
       else
       {
           console.log('saved');
           req_validation=1;
           findRequests();
           res.redirect('/users/request');
       }
   }
   );
   MongoClient.connect(url,function(err,client)
   {
    var db=client.db('shareyourride');
    if(err)
    {
        console.log('something went wrong');
    }
    else{
        db.collection('requestschemas').updateOne(
            {"id":new ObjectID(id)},
            {$set:{reqstatus:1}},
            function(){
                    console.log("after request sent"+{data});
                    io.emit('output',[data]);
                    console.log("success");
                      //Send status obj
                      
          });
    }
   });
        console.log('From getData'+data.name);
    });
    
   
});  
router.post('/sendconfirm',function(req,res)
{
    console.log("inside sendconfirm");
    console.log("Login user id:"+id);
    console.log('Requester id:'+requester_id);
    MongoClient.connect(url,function(err,client)
    {
        var db=client.db('shareyourride');
        if(err)
        {
            console.log('something went wrong');
        }
        else
        {
        
                db.collection('requestschemas').updateOne(
                    {"id":new ObjectID(req.body.req_id)},
                    {$set:{reqstatus:2,acceptedBy:req.user._id}});
                    db.collection('requestschemas').findOne({"id":new ObjectID(req.body.req_id)}).then((docs)=>{
                        //console.log(docs);
                        if(docs==null)
                        {
                            console.log("null");
                            io.emit('output',0);
                        }
                        else
                        {
                            var datetime = new Date();
                            datetime=datetime.toISOString().slice(0,10);
                            console.log("sendconfirm reqstatus:"+docs.reqstatus);
                                io.emit('output',docs);
                                var newGive=new GivenSchema({
                                    id:req.user._id,
                                    to:docs.name,
                                    where:'clg',
                                    pickuplocation:docs.pickuplocation,
                                    time:docs.time,
                                    date:datetime
                                });
                                newGive.save(function(err)
                                {
                                    if(err)
                                    {
                                        console.log(err);
                                        req.flash('error_msg','Your request is already exist');
                                    
                                    }
                                    else
                                    {
                                        console.log('givenschema saved');
                                       
                                    }
                                }
                                );

                                MongoClient.connect(url,function(err,client)
                                {
                                    var db=client.db('shareyourride');
                                    console.log('working');
                                    try
                                    {

                                        db.collection('users').findOne({"_id":new ObjectID(req.user._id)}).then((data)=>{
                                         
                                            var newtaken=new TakenSchema({
                                                id:docs.id,
                                                from:data.name,
                                                where:'clg',
                                                pickuplocation:docs.pickuplocation,
                                                time:docs.time,
                                                date:datetime
            
                                            });
                                            newtaken.save(function(err)
                                            {
                                                if(err)
                                                {
                                                    console.log(err);
                                                        
                                                }
                                                else
                                                {
                                                    console.log('takenschema saved');
                                                
                                                }
                                            }
                                            );

                                        });
                                    }
                                    catch(e)
                                    {
                                        console.log(e);
                                    }
                                    
                                });
                                
                        }
                        });

                 
            
        }
    });
   //res.redirect('/users/confirmride');
   res.render('confirmed',{req:req.body.req_id}); 

});
router.post('/cancelRequest',function(req,res)
{
    MongoClient.connect(url,function(err,client)
    {
     var db=client.db('shareyourride');
     if(err)
     {
         console.log('something went wrong');
     }
     else{
       
             db.collection('requestschemas').deleteOne({"id":new ObjectID(req.user._id)},function(err,obj){
                 if(err)
                 throw err;
             });
                 db.collection('requestschemas').findOne({"id":new ObjectID(req.user._id)}).then((docs)=>{
                     if(docs==null)
                     {
                         //io.emit('output',0);
                         //res.redirect('request');
                         findRequests();
                         res.redirect('/users/request');
                     }
                     else
                     {
                             //io.emit('output',docs);
                     }
                     });
     }
    });
});
router.get('/logout',nocache,ensureAuthenticated1,function(req,res){
    req.logout();

    req.flash('success_msg','You are logged out');
    res.redirect('/users/login');
});
router.get('/taken',nocache,ensureAuthenticated1,function(req,res)
{
    MongoClient.connect(url,function(err,client)
        {
            var arr=[];
            var db=client.db('shareyourride');
            db.collection('takenschemas').find({"id":new ObjectID(req.user._id)}).forEach(function(myDoc){
                arr.push(myDoc);
                
            }).then(()=>{
                res.render('taken',{arr});
            });
        });
 
});
router.get('/given',nocache,ensureAuthenticated1,function(req,res)
{
    
    MongoClient.connect(url,function(err,client)
        {
            var arr=[];
            var db=client.db('shareyourride');
            db.collection('givenschemas').find({"id":new ObjectID(req.user._id)}).forEach(function(myDoc){
                arr.push(myDoc);
                
            }).then(()=>{
                res.render('given',{arr});
            });
        });
 
 
});
router.post('/reqrating',nocache,ensureAuthenticated1,function(req,res)
{

    MongoClient.connect(url,function(err,client)
        {
            var db=client.db('shareyourride');
            db.collection('requestschemas').updateOne(
                {"id":new ObjectID(req.body.req_id)},
                {$set:{reqstatus:3,acceptedBy:req.user._id}});
                db.collection('requestschemas').findOne({"id":new ObjectID(req.body.req_id)}).then((docs)=>{
                    //console.log(docs);
                    if(docs==null)
                    {
                        console.log("null");
                        io.emit('output',0);
                    }
                    else
                    {
                      
                        console.log("sendconfirm reqstatus:"+docs.reqstatus);
                            io.emit('output',docs);
                    }
                });
        
        });
    
});
module.exports=router;