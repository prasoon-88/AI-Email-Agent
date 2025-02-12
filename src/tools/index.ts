export const sendEmail = (arg: {
  to: string;
  subject: string;
  body: string;
}) => {
  console.log("Sending Email to ", arg);
  return true;
};

export const tools = {
  sendEmail,
};
