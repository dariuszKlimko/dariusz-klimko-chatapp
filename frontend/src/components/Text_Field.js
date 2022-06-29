import TextField from '@mui/material/TextField';


function Text_Field({value, multiline, label, required, fullWidth, handleOnChange, onKeyDown, disabled, color, error, shrink, variant}) {
  
  const inputStyle = { WebkitBoxShadow: `0 0 0 1000px ${color} inset` };

  return (
    <TextField 
      onChange={(e)=>handleOnChange(e.target.value)} 
      onKeyDown={(e)=>e.key==='Enter'&&onKeyDown(e)} 
      value={value} multiline={multiline} 
      label={label} required={required} 
      fullWidth={fullWidth} 
      disabled={disabled} 
      inputProps={{ style: inputStyle }} 
      error={error} 
      InputLabelProps={{shrink: shrink}} 
      id="outlined-basic"  
      variant={variant} 
    />
  );
}

export default Text_Field;