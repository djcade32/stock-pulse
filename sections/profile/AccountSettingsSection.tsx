"use client";

import LoaderComponent from "@/components/general/LoaderComponent";
import ProfileSettingRow from "@/components/profile/ProfileSettingRow";
import { useUid } from "@/hooks/useUid";
import { deleteAccount, signOut } from "@/lib/actions/auth.client.action";
import ConfirmationModal from "@/modals/ConfirmationModal";
import React, { useState } from "react";
import { FaSignOutAlt, FaTrash } from "react-icons/fa";

const AccountSettingsSection = () => {
  const { loading } = useUid();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  return (
    <>
      <LoaderComponent
        height="200px"
        width="100%"
        loading={loading}
        rounded="lg"
        className="bg-(--secondary-color) p-6 rounded-lg flex flex-col gap-4"
      >
        <h2 className="text-xl font-bold">Account Settings</h2>
        <ProfileSettingRow
          title="Sign Out"
          actionText="Sign Out"
          onActionClick={async () => signOut()}
          description="Sign out of your current session"
          icon={FaSignOutAlt}
          iconVariant="ghost"
          actionButtonClassName="bg-(--secondary-color) border-(--gray-accent-color) border"
        />
        <ProfileSettingRow
          title="Delete Account"
          actionText="Delete Account"
          onActionClick={() => setShowConfirmModal(true)}
          description="Permanently delete your account and all associated data"
          icon={FaTrash}
          iconVariant="danger"
          actionButtonVariant="danger"
          rowClassName="border border-(--danger-color)/50"
        />
      </LoaderComponent>
      <ConfirmationModal
        title="Delete Account"
        message="Are you sure you want to delete your account? This action is irreversible and will permanently remove all your data."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        open={showConfirmModal}
        setOpen={setShowConfirmModal}
        onConfirm={async () => {
          try {
            await deleteAccount();
          } catch (error) {
            console.error("Error deleting account:", error);
          }
        }}
      />
    </>
  );
};

export default AccountSettingsSection;
