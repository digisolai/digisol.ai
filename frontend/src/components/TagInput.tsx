import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
  placeholder?: string;
  isRequired?: boolean;
}

const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  label,
  placeholder = 'Type and press Enter...',
  isRequired = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <FormControl isRequired={isRequired}>
      <FormLabel>{label}</FormLabel>
      <HStack spacing={2} align="start">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          size="md"
        />
      </HStack>
      {value.length > 0 && (
        <Wrap spacing={2} mt={2}>
          {value.map((tag, index) => (
            <WrapItem key={index}>
              <Tag size="md" colorScheme="brand" borderRadius="full">
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => removeTag(tag)} />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      )}
    </FormControl>
  );
};

export default TagInput; 