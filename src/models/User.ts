import { TYPE_OF_TASK } from "@/types/User";
import { UUID } from "mongodb";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: UUID, required: true },
  accessToken: { type: UUID, required: true },
  typeOfTask: {
    type: String,
    enum: Object.values(TYPE_OF_TASK),
    required: true,
  },
  datetimeSurveyStarted: { type: Date },
  chatHistory: { type: Array, default: [] },
  results: { type: String, default: "" },
  currentStep: { type: Number, default: null },
  datetimeSurveyFinishedEarly: { type: Date, default: null },
});

export const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);
