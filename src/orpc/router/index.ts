import {
  changePassword,
  getSession,
  requestPasswordReset,
  resetPassword,
  signIn,
  signOut,
  signUp,
  updateUser,
} from "./auth";
import { addTodo, listTodos } from "./todos";

export default {
  auth: {
    signUp,
    signIn,
    signOut,
    getSession,
    changePassword,
    updateUser,
    requestPasswordReset,
    resetPassword,
  },
  listTodos,
  addTodo,
};
