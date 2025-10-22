import React from "react";
import UserInfoSection from "@/sections/profile/UserInfoSection";
import PasswordAndEmailSection from "@/sections/profile/PasswordAndEmailSection";
import LoginMethods from "@/sections/profile/LoginMethods";
import AccountSettingsSection from "@/sections/profile/AccountSettingsSection";

const ProfilePage = () => {
  return (
    <div className="page">
      <div>
        <h1 className="page-header-text">Profile</h1>
        <p className="text-(--secondary-text-color) mt-2">
          Manage your personal information, and login settings.
        </p>
      </div>
      <UserInfoSection />
      <PasswordAndEmailSection />
      <LoginMethods />
      <AccountSettingsSection />
    </div>
  );
};

export default ProfilePage;
