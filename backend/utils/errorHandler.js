const handleError = (error, res) => {
  console.log("Error - ",error);
  res.status(error.status || 500);
  res.json({ 
    message: error.message 
  });
}

export default handleError;