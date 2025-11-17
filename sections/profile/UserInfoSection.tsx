"use client";

import Button from "@/components/general/Button";
import Input from "@/components/general/Input";
import { auth, db } from "@/firebase/client";
import { cn } from "@/lib/utils";
import { CircleUser, Save, SquarePen } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { updateProfile } from "firebase/auth";
import { useUid } from "@/hooks/useUid";
import LoaderComponent from "@/components/general/LoaderComponent";
import { toast } from "sonner";
import { doc, setDoc } from "firebase/firestore";
import { useIsMobile } from "@/hooks/use-mobile";

const UserInfoSection = () => {
  const { loading } = useUid();
  const inputRef = useRef<HTMLInputElement>(null);

  const user = auth.currentUser;
  const createdAt = user?.metadata.creationTime;
  const [displayName, setDisplayName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [inputHasError, setInputHasError] = useState(false);

  const isMobile = useIsMobile();

  useEffect(() => {
    if (user && user.displayName) {
      setDisplayName(user.displayName);
    } else {
      setDisplayName("Unknown");
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    isEditing && inputRef.current?.focus();
  }, [isEditing]);

  async function handleEditClick() {
    if (isEditing) {
      await persistUserNameChange();
    } else {
      setIsEditing(true);
    }
  }

  async function persistUserNameChange() {
    if (user) {
      try {
        const name = displayName.trim();
        if (name === user.displayName) return setIsEditing(false);
        if (name.length === 0) {
          setInputHasError(true);
          toast.error("Name cannot be empty.");
          return;
        }
        console.log("Updating profile with name: ", name);
        await updateProfile(user, {
          displayName: name,
        });
        const userDoc = doc(db, `users/${user.uid}`);
        await setDoc(userDoc, { name }, { merge: true });
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setInputHasError(false);
      } catch (error) {
        setDisplayName(user.displayName || "Unknown");
        console.error("Error updating profile: ", error);
        toast.error("Failed to update profile. Please try again.");
        setIsEditing(false);
      }
    }
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setDisplayName(value);
    setInputHasError(value.trim().length === 0);
  }

  return (
    <LoaderComponent
      height="100px"
      width="100%"
      loading={loading}
      rounded="lg"
      className={cn(
        "bg-(--secondary-color) rounded-lg flex items-center justify-between",
        isMobile ? "flex-col gap-4 p-4" : "p-6"
      )}
      loadingClassName="bg-(--secondary-color)"
    >
      <div className="flex items-center gap-4">
        <CircleUser size={48} color="var(--secondary-text-color)" />
        <div className="flex flex-col">
          <Input
            ref={inputRef}
            onChange={handleNameChange}
            disabled={!isEditing}
            value={displayName}
            placeholder="Enter your name"
            type="text"
            className={cn(
              "focus:ring-0 focus:outline-none p-0 font-bold text-lg md:text-2xl",
              isEditing
                ? "focus:ring-1 focus:ring-(--accent-color) pl-3"
                : "bg-transparent cursor-text border-none rounded-none",
              inputHasError && "border border-(--danger-color) focus:ring-(--danger-color)"
            )}
          />
          {createdAt && (
            <p className={cn("text-(--secondary-text-color)", isMobile && "text-sm")}>
              Member since
              {` ${new Date(createdAt).toLocaleString("default", { month: "long" })} ${new Date(
                createdAt
              ).getFullYear()}`}
            </p>
          )}
        </div>
      </div>
      <div className={cn(isMobile ? "w-full" : "")}>
        <Button
          onClick={handleEditClick}
          variant={isEditing ? "default" : "outline"}
          className={cn(
            isEditing ? "" : "bg-transparent border-(--gray-accent-color)",
            isMobile && "w-full"
          )}
        >
          {isEditing ? <Save size={16} /> : <SquarePen size={16} />}
          {isEditing ? "Save" : "Edit"}
        </Button>
      </div>
    </LoaderComponent>
  );
};

export default UserInfoSection;
