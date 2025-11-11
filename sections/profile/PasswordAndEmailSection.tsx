"use client";

import Button from "@/components/general/Button";
import Input from "@/components/general/Input";
import LoaderComponent from "@/components/general/LoaderComponent";
import ProfileSettingRow from "@/components/profile/ProfileSettingRow";
import { auth, db } from "@/firebase/client";
import { useUid } from "@/hooks/useUid";
import { cn } from "@/lib/utils";
import ChangePasswordModal from "@/modals/profile/ChangePasswordModal";
import ReauthenticationModal from "@/modals/profile/ReauthenticationModal";
import { onIdTokenChanged, verifyBeforeUpdateEmail } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaLock } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { toast } from "sonner";

const PasswordAndEmailSection = () => {
  const { loading } = useUid();
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Keep user in React state instead of reading a snapshot once
  const [user, setUser] = useState(() => auth.currentUser);
  const [providerData, setProviderData] = useState(() => auth.currentUser?.providerData ?? []);

  useEffect(() => {
    // Subscribe to auth changes; also reload to refresh providerData
    const unsub = onIdTokenChanged(auth, async (u) => {
      setUser(u ?? null);
      setProviderData(u?.providerData ?? []);
    });
    return unsub;
  }, []);

  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [inputHasError, setInputHasError] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // ✅ Derive from user in state (no need for useMemo here, but fine if you prefer)
  const hasEmailAndPasswordProvider = useMemo(() => {
    const providers = user?.providerData?.map((p) => p.providerId) ?? [];
    return providers.includes("password");
  }, [providerData]); // now this is a stable state-driven dep

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  async function handleChangeClick() {
    if (isEditing) {
      const newEmail = email.trim();
      if (user && newEmail === user.email) return setIsEditing(false);
      if (newEmail.length === 0) {
        setInputHasError(true);
        toast.error("Email cannot be empty.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        setInputHasError(true);
        toast.error("Please enter a valid email address.");
        return;
      }
      setShowReauthModal(true);
    } else {
      setIsEditing(true);
    }
  }

  async function persistEmailChange() {
    if (!user) return;
    try {
      const newEmail = email.trim();
      const emailExists = query(collection(db, "users"), where("email", "==", newEmail));
      const snapshot = await getDocs(emailExists);
      if (!snapshot.empty) {
        toast.error("The email address is already in use by another account.", { duration: 8000 });
        return;
      }
      await verifyBeforeUpdateEmail(user, newEmail);
      await user.reload(); // refreshes providerData & email
      setIsEditing(false);
      setInputHasError(false);
      toast.success(
        "Email updated successfully! Please check your inbox to verify the new email.",
        {
          duration: 8000,
        }
      );
    } catch (error) {
      console.error("Error updating email: ", error);
      setInputHasError(true);
      const code = (error as { code?: string }).code;
      if (code === "auth/invalid-email") toast.error("The email address is not valid.");
      else if (code === "auth/email-already-in-use")
        toast.error("The email address is already in use by another account.");
      else toast.error("Failed to update email. Please try again later.");
      setEmail(user.email || "");
    }
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setEmail(value);
    setInputHasError(value.trim().length === 0);
  }

  return (
    <>
      {hasEmailAndPasswordProvider && (
        <LoaderComponent
          height="200px"
          width="100%"
          loading={loading}
          rounded="lg"
          className="bg-(--secondary-color) p-6 rounded-lg flex flex-col gap-4"
          loadingClassName="bg-(--secondary-color)"
        >
          <h2 className="text-xl font-bold">Password & Email Management</h2>
          <ProfileSettingRow
            title="Password"
            actionText="Change Password"
            onActionClick={() => setShowChangePasswordModal(true)}
            description="Update your account password"
            icon={FaLock}
          />
          <div className="bg-(--background) p-4 rounded-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center justify-center bg-[#FF9800]/20 p-2 rounded-lg w-10 h-10">
                <MdEmail className="text-[#FF9800]" />
              </div>
              <div className="w-full">
                <p className="font-bold">Email Address</p>
                <Input
                  ref={inputRef}
                  value={email}
                  disabled={!isEditing}
                  onChange={handleEmailChange}
                  className={cn(
                    "focus:ring-0 focus:outline-none p-0 text-sm ",
                    isEditing
                      ? "focus:ring-1 focus:ring-(--accent-color) pl-3"
                      : "bg-transparent cursor-text border-none rounded-none text-(--secondary-text-color)",
                    inputHasError && "border border-(--danger-color) focus:ring-(--danger-color)"
                  )}
                />
              </div>
            </div>
            <Button
              onClick={handleChangeClick}
              className="bg-(--secondary-color) border-(--gray-accent-color) border"
            >
              <p>{isEditing ? "Save" : "Change Email"}</p>
            </Button>
          </div>
        </LoaderComponent>
      )}
      <ReauthenticationModal
        open={showReauthModal}
        setOpen={setShowReauthModal}
        onSubmit={persistEmailChange}
      />
      <ChangePasswordModal
        open={showChangePasswordModal}
        setOpen={setShowChangePasswordModal}
        onSubmit={async () => {}}
      />
    </>
  );
};

export default PasswordAndEmailSection;
