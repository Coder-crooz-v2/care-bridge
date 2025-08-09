"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scan,
  MessageCircle,
  Activity,
  Shield,
  Users,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import RotatingText from "../ui/rotating-text";

export default function MedicalAssistantLanding() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const features = [
    {
      icon: <Scan className="h-8 w-8" />,
      title: "Smart Prescription Scanner",
      description:
        "AI-powered prescription scanning that extracts medicine information, creates automated reminders, and finds nearby pharmacies. Get lifestyle suggestions and disease insights.",
      benefits: [
        "Automated medication reminders",
        "Pharmacy locator",
        "AI health insights",
        "Calendar integration",
      ],
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Medical Chatbot Assistant",
      description:
        "Get instant guidance for common health issues. Our AI provides lifestyle recommendations and connects you with qualified doctors when needed.",
      benefits: [
        "24/7 health guidance",
        "Lifestyle recommendations",
        "Doctor referrals",
        "Safe medical advice",
      ],
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: "Real-Time Health Monitoring",
      description:
        "Continuous tracking of vital signs including pulse, blood pressure, temperature, and respiration. Advanced anomaly detection with instant alerts.",
      benefits: [
        "Continuous vital monitoring",
        "Anomaly detection",
        "Health alerts",
        "Menstrual cycle tracking",
      ],
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "500+", label: "Partner Doctors" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ];

  const whyChooseUs = [
    {
      icon: <Shield className="h-6 w-6 mt-1 text-primary/60" />,
      title: "HIPAA Compliant & Secure",
      desc: "End-to-end encryption ensures your medical data stays private and secure.",
    },
    {
      icon: <Users className="h-6 w-6 mt-1 text-primary/60" />,
      title: "Doctor Integration",
      desc: "Seamless connection between patients and healthcare providers with real-time monitoring.",
    },
    {
      icon: <Clock className="h-6 w-6 mt-1 text-primary/60" />,
      title: "24/7 Availability",
      desc: "Round-the-clock health monitoring and instant emergency alerts.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-8"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                    AI-Powered Healthcare Assistant
                  </Badge>
                </motion.div>
                <motion.h1
                  className="text-3xl max-sm:text-center md:text-6xl font-bold text-gray-900 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  Your Complete
                  <span className="text-primary">
                    <RotatingText
                      texts={[
                        "Digital",
                        "Automatic",
                        "Intelligent",
                        "Connected",
                      ]}
                      mainClassName="px-2 sm:px-2 md:px-3 text-primary text-black overflow-hidden py-0.5 sm:py-1 md:py-1 max-sm:justify-center justify-start rounded-lg"
                      staggerFrom={"last"}
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "-120%" }}
                      staggerDuration={0.025}
                      splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                      transition={{
                        type: "spring",
                        damping: 30,
                        stiffness: 400,
                      }}
                      rotationInterval={2000}
                    />{" "}
                    Health{" "}
                  </span>
                  Companion
                </motion.h1>
                <motion.p
                  className="text-lg max-sm:text-center md:text-xl text-gray-600 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                >
                  Revolutionary medical assistance combining AI-powered
                  prescription scanning, intelligent health chatbot, and
                  real-time vital monitoring for comprehensive healthcare
                  management.
                </motion.p>
              </div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Button className="bg-primary hover:bg-primary-hover text-primary-foreground text-lg px-8 py-3">
                  Start Free Trial
                </Button>
                <Button
                  variant="outline"
                  className="border-border text-primary hover:bg-secondary text-lg px-8 py-3"
                >
                  Watch Demo
                </Button>
              </motion.div>

              <motion.div
                className="flex items-center gap-4 md:gap-8 pt-4"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    variants={fadeIn}
                  >
                    <motion.div
                      className="text-lg md:text-2xl font-bold text-blue-600"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.8 + index * 0.1,
                      }}
                    >
                      {stat.number}
                    </motion.div>
                    <div className="text-xs md:text-sm text-gray-600">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Medical technology interface"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <motion.div
                className="absolute -top-4 max-sm:right-2 -right-4 max-sm:w-44 max-sm:h-44 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 0.5, 0.7],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              ></motion.div>
              <motion.div
                className="absolute -bottom-8 -left-4 max-sm:w-44 max-sm:h-44 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 0.4, 0.7],
                }}
                transition={{
                  duration: 10,
                  delay: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              ></motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three powerful tools working together to provide complete medical
              assistance for patients and healthcare providers.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, delay: index * 0.2 },
                  },
                }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-blue-100">
                  <CardHeader>
                    <motion.div
                      className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300"
                      whileHover={{
                        rotate: 360,
                        transition: { duration: 0.6 },
                      }}
                    >
                      {feature.icon}
                    </motion.div>
                    <CardTitle className="text-xl text-gray-900">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li
                          key={benefitIndex}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <motion.div
                            className="w-2 h-2 bg-blue-400 rounded-full mr-3"
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * benefitIndex }}
                          ></motion.div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose CareBridge?
              </h2>
              <motion.div
                className="space-y-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {whyChooseUs.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-start space-x-4"
                    variants={fadeIn}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {item.icon}
                    </motion.div>
                    <div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-blue-100">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img
                src="https://images.unsplash.com/photo-1631217873436-b0fa88e71f0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Doctor using tablet for patient monitoring"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-50">
        <motion.div
          className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who trust CareBridge for their daily health
            management.
          </p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            whileInView={{
              transition: { staggerChildren: 0.2 },
            }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
              >
                Get Started Today
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 text-lg px-8 py-3"
              >
                Schedule Demo
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
