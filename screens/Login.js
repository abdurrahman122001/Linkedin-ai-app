import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch as RNSwitch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Feather"; // Using Feather icons for eye/eye-off

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("https://ai.brannovate.com/api/login", {
        email,
        password,
      });
      // Save token and expiry (15 minutes from now)
      await AsyncStorage.setItem("token", response.data.access_token);
      const expiryTimestamp = Date.now() + 15 * 60 * 1000;
      await AsyncStorage.setItem("tokenExpiry", expiryTimestamp.toString());
      navigation.navigate("LinkedIn AI"); // Adjust this route name as needed
    } catch (err) {
      setError("Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navbar}>
          <Image
            source={require("../assets/img/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.signupNav}>Sign up</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Sign <Text style={{ color: "#000" }}>in</Text>
          </Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Your email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={toggleShowPassword}
              style={styles.eyeButton}
            >
              <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Remember Me Switch */}
          <View style={styles.rememberContainer}>
            <RNSwitch
              value={rememberMe}
              onValueChange={setRememberMe}
            />
            <Text style={styles.rememberText}>Remember Me</Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.submitButton, loading && styles.disabledButton]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text>
            Don’t you have an account?{" "}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate("SignUp")}
            >
              Sign up
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 50,
  },
  signupNav: {
    color: "#0000FF",
    fontSize: 16,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#D60000",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
  },
  label: {
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 15,
  },
  eyeButton: {
    padding: 10,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberText: {
    marginLeft: 8,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#0000FF",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#0000FF",
    textDecorationLine: "underline",
  },
});

export default LoginForm;
