var mongoose=require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var TakenSchema=mongoose.Schema(
  {
    id:
    {
        type:ObjectId,
        unique:true
    },
    from:
    {
      type:String
    },
    where:
    {
        type:String
    },
    pickuplocation:
    {
        type:String
    },
    time:
    {
        type:String
    },
    date:
    {
      type:String
    }
   
  });
var TakenSchema=module.exports=mongoose.model('TakenSchema',TakenSchema);