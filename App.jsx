import React, { useState, useEffect, useCallback } from "react";
import {
  Home, PlusCircle, Search, User, MapPin, Clock, Star,
  Wrench, Truck, Sparkles, Laptop, Package, FileText,
  CheckCircle2, ShieldCheck, Send, Award, TrendingUp,
  Smartphone, AlertCircle, Loader2, RefreshCw
} from "lucide-react";
import { supabase } from "./supabaseClient";

/* DESIGN TOKENS
   Ink Navy #14213D | Paper #F7F4EC | Signal Amber #FFB627
   Helper Green #2D6A4F | Slate #6B7280 | Alert Coral #E4572E */

const CATEGORIES = [
  { id: "errand", label: "Errands", icon: Package, color: "#FFB627" },
  { id: "repair", label: "Repairs", icon: Wrench, color: "#E4572E" },
  { id: "clean", label: "Cleaning", icon: Sparkles, color: "#2D6A4F" },
  { id: "move", label: "Moving", icon: Truck, color: "#14213D" },
  { id: "tech", label: "Tech Help", icon: Laptop, color: "#FFB627" },
  { id: "paper", label: "Paperwork", icon: FileText, color: "#2D6A4F" },
];

const AREAS = [
  "Kololo", "Nakasero", "Ntinda", "Naalya", "Kiwatule", "Bugolobi",
  "Muyenga", "Kamwokya", "Wandegeya", "Kansanga", "K
