var mongoose=require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var GivenSchema=mongoose.Schema(
  {
    id:
    {
        type:ObjectId,
        unique:true
    },
    to:
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
var GivenSchema=module.exports=mongoose.model('GivenSchema',GivenSchema);