// frontend/src/pages/LoginPage.tsx
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
  // Image,
} from "@chakra-ui/react";
import { Logo } from "../components/Logo"; // Corrected relative path
import { useNavigate, Link as RouterLink } from "react-router-dom"; // Added useNavigate
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate(); // Now using useNavigate here
  const { login } = useAuth();

  const validate = () => {
    const errs: typeof errors = {};
    if (!email) errs.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = "Invalid email format.";
    if (!password) errs.password = "Password is required.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setErrors({});

    try {
      await login(email, password); // Call login function
      toast({ title: "Login successful!", status: "success", duration: 2000, isClosable: true });
      navigate("/dashboard"); // Navigate on success
    } catch (err: unknown) {
      console.error("Login error details:", err); // Enhanced error logging
      const backendErrors = err.response?.data;
      console.error("Login error:", err); // Log full AxiosError object

      if (backendErrors) {
        const newErrors: typeof errors = {};
        if (backendErrors.detail) newErrors.general = backendErrors.detail; // For messages like "No active account found with the given credentials"
        if (backendErrors.email) newErrors.email = backendErrors.email[0];
        if (backendErrors.password) newErrors.password = backendErrors.password[0];
        setErrors(newErrors);

        if (newErrors.general) {
          toast({ title: "Login Error", description: newErrors.general, status: "error", duration: 3000, isClosable: true });
        } else {
          toast({ title: "Login Failed", description: "Please check your credentials.", status: "error", duration: 3000, isClosable: true });
        }
      } else {
        setErrors({ general: err.message || "Login failed. Please try again." });
        toast({ title: "Error", description: err.message || "Login failed. Please try again.", status: "error", duration: 3000, isClosable: true });
      }
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
          <Heading size="md" color="brand.primary" textAlign="center">Sign in to DigiSol.AI</Heading>
          {errors.general && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {errors.general}
            </Alert>
          )}
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
          <FormControl isInvalid={!!errors.password} isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              bg="brand.neutral.50"
            />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>
          <Link as={RouterLink} to="/forgot-password" color="brand.accent" fontWeight="medium" alignSelf="flex-end">
            Forgot password?
          </Link>
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
            Sign In
          </Button>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Text>
              Don't have an account?{' '}
              <Link as={RouterLink} to="/signup" color="brand.accent" fontWeight="medium">Sign up</Link>
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}