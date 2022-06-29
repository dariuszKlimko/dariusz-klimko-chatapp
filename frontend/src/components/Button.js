import Button from '@mui/material/Button';


function BasicButtons({onClick, disabled, type, fullWidth, label, color, textColor, border}) {

  return (
    <Button 
      onClick={onClick}  
      disabled={disabled} 
      type={type} 
      fullWidth={fullWidth} 
      color={color} 
      sx={{color:textColor, border: border}} 
      variant="contained" 
    >
      {label}
    </Button>
  );
}

export default BasicButtons;