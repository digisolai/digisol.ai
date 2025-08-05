import { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  HStack,
  Box,
} from '@chakra-ui/react';

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  isRequired?: boolean;
}

const ColorInput: React.FC<ColorInputProps> = ({
  value = '#3B82F6',
  onChange,
  label,
  isRequired = false,
}) => {
  const [hexValue, setHexValue] = useState(value);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    onChange(newColor);
    setHexValue(newColor);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setHexValue(hex);
    
    // Validate hex format and update if valid
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      onChange(hex);
    }
  };

  const handleHexBlur = () => {
    // Ensure hex value is valid on blur
    if (!/^#[0-9A-F]{6}$/i.test(hexValue)) {
      setHexValue(value);
    }
  };

  return (
    <FormControl isRequired={isRequired}>
      <FormLabel>{label}</FormLabel>
      <HStack spacing={3}>
        <Box position="relative">
          <Input
            type="color"
            value={value}
            onChange={handleColorChange}
            w="60px"
            h="40px"
            p={1}
            borderRadius="md"
            cursor="pointer"
          />
        </Box>
        <Input
          value={hexValue}
          onChange={handleHexChange}
          onBlur={handleHexBlur}
          placeholder="#3B82F6"
          maxLength={7}
          fontFamily="mono"
        />
      </HStack>
    </FormControl>
  );
};

export default ColorInput; 