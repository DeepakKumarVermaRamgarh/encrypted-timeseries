import mongoose, { Schema, Document, Model } from "mongoose";

// export interface IMessage extends Document {
//   name: string;
//   origin: string;
//   destination: string;
//   secret_key: string;
// }

const messageSchema = new mongoose.Schema(
  {
    messages: [],
  },
  { timestamps: true }
);

const messageModel = mongoose.model("Message", messageSchema);
export default messageModel;
