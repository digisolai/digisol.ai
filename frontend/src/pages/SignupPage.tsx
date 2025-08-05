// frontend/src/pages/SignupPage.tsx
import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  VStack,
  Heading,
  Link,
  useToast,
  Alert,
  AlertIcon,
  Text,
} from "@chakra-ui/react";
import { Logo } from "../components/Logo"; // Go up one level, then into components
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// --- CRITICAL: Ensure export function SignupPage() is AT THE TOP LEVEL here ---
export function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string; general?: string; firstName?: string; lastName?: string }>({}); // Added types for first/last name errors
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { register } = useAuth();

  const validate = () => {
    const errs: typeof errors = {};
    if (!firstName) errs.firstName = "First Name is required.";
    if (!lastName) errs.lastName = "Last Name is required.";
    if (!email) errs.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = "Invalid email format.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (!confirm) errs.confirm = "Please confirm your password.";
    else if (password !== confirm) errs.confirm = "Passwords do not match.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      await register(email, password, firstName, lastName, confirm);
      toast({ title: "Signup successful!", status: "success", duration: 2000, isClosable: true });
      navigate("/dashboard");
    } catch (err: unknown) {
      const backendErrors = err.response?.data;
      console.error("Backend Validation Errors:", backendErrors); // Log detailed backend errors

      if (backendErrors) {
        // Map backend errors to frontend state
        const newErrors: typeof errors = {};
        if (backendErrors.email) newErrors.email = backendErrors.email[0] || backendErrors.email;
        if (backendErrors.password) newErrors.password = backendErrors.password[0] || backendErrors.password;
        if (backendErrors.first_name) newErrors.firstName = backendErrors.first_name[0] || backendErrors.first_name;
        if (backendErrors.last_name) newErrors.lastName = backendErrors.last_name[0] || backendErrors.last_name;
        if (backendErrors.non_field_errors) newErrors.general = backendErrors.non_field_errors[0];

        setErrors(newErrors);

        // Show toasts for general or critical errors not tied to a field
        if (newErrors.general) {
          toast({ title: "Error", description: newErrors.general, status: "error", duration: 3000, isClosable: true });
        } else if (backendErrors.detail) { // For errors like "Authentication credentials were not provided."
            setErrors({ general: backendErrors.detail });
            toast({ title: "Error", description: backendErrors.detail, status: "error", duration: 3000, isClosable: true });
        }

      } else {
        // Fallback for unexpected errors
        setErrors({ general: err.message || "Signup failed. Please try again." });
        toast({ title: "Error", description: err.message || "Signup failed. Please try again.", status: "error", duration: 3000, isClosable: true });
      }
      console.error("Signup AxiosError object:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="brand.neutral.50" display="flex" alignItems="center" justifyContent="center" position="relative" overflow="hidden">
      {/* Background Logo */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        opacity={0.03}
        zIndex={0}
        pointerEvents="none"
      >
        <Logo size={800} />
      </Box>
      
      <Box bg="white" p={8} rounded="xl" boxShadow="lg" w="full" maxW="md" position="relative" zIndex={1}>
        <VStack spacing={6} as="form" onSubmit={handleSubmit} align="stretch">
          <Box alignSelf="center">
            <Logo size={100} />
          </Box>
          <Heading size="md" color="brand.primary" textAlign="center">Create your DigiSol.AI account</Heading>
          {errors.general && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {errors.general}
            </Alert>
          )}
          {/* First Name Input with name attribute */}
          <FormControl isRequired isInvalid={!!errors.firstName}>
            <FormLabel>First Name</FormLabel>
            <Input
              type="text"
              name="first_name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="First Name"
              autoComplete="given-name"
              bg="brand.neutral.50"
            />
            <FormErrorMessage>{errors.firstName}</FormErrorMessage>
          </FormControl>
          {/* Last Name Input with name attribute */}
          <FormControl isRequired isInvalid={!!errors.lastName}>
            <FormLabel>Last Name</FormLabel>
            <Input
              type="text"
              name="last_name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Last Name"
              autoComplete="family-name"
              bg="brand.neutral.50"
            />
            <FormErrorMessage>{errors.lastName}</FormErrorMessage>
          </FormControl>
          {/* Email Input with name attribute */}
          <FormControl isInvalid={!!errors.email} isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              bg="brand.neutral.50"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>
          {/* Password Input with name attribute */}
          <FormControl isInvalid={!!errors.password} isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="new-password"
              bg="brand.neutral.50"
            />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>
          {/* Confirm Password Input with name attribute */}
          <FormControl isInvalid={!!errors.confirm} isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              name="confirm_password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm Password"
              autoComplete="new-password"
              bg="brand.neutral.50"
            />
            <FormErrorMessage>{errors.confirm}</FormErrorMessage>
          </FormControl>
          <Button
            type="submit"
            colorScheme="brand"
            bg="brand.primary"
            color="white"
            isLoading={loading}
            _hover={{ bg: "#163166" }}
            size="lg"
            rounded="md"
            fontWeight="bold"
            shadow="sm"
          >
            Sign Up
          </Button>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Text>
              Already have an account?{' '}
              <Link as={RouterLink} to="/login" color="brand.accent" fontWeight="medium">Sign in</Link>
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}