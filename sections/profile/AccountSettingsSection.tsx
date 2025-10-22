// "use client";

// import LoaderComponent from "@/components/general/LoaderComponent";
// import ProfileSettingRow from "@/components/profile/ProfileSettingRow";
// import { useUid } from "@/hooks/useUid";
// import { deleteAccount, signOut } from "@/lib/actions/auth.client.action";
// import ConfirmationModal from "@/modals/ConfirmationModal";
// import React, { useState } from "react";
// import { FaSignOutAlt, FaTrash } from "react-icons/fa";

// const AccountSettingsSection = () => {
//   const { loading } = useUid();
//   const [showConfirmModal, setShowConfirmModal] = useState(false);

//   return (
//     <>
//       <LoaderComponent
//         height="200px"
//         width="100%"
//         loading={loading}
//         rounded="lg"
//         className="bg-(--secondary-color) p-6 rounded-lg flex flex-col gap-4"
//       >
//         <h2 className="text-xl font-bold">Account Settings</h2>
//         <ProfileSettingRow
//           title="Sign Out"
//           actionText="Sign Out"
//           onActionClick={async () => signOut()}
//           description="Sign out of your current session"
//           icon={FaSignOutAlt}
//           iconVariant="ghost"
//           actionButtonClassName="bg-(--secondary-color) border-(--gray-accent-color) border"
//         />
//         <ProfileSettingRow
//           title="Delete Account"
//           actionText="Delete Account"
//           onActionClick={() => setShowConfirmModal(true)}
//           description="Permanently delete your account and all associated data"
//           icon={FaTrash}
//           iconVariant="danger"
//           actionButtonVariant="danger"
//           rowClassName="border border-(--danger-color)/50"
//         />
//       </LoaderComponent>
//       <ConfirmationModal
//         title="Delete Account"
//         message="Are you sure you want to delete your account? This action is irreversible and will permanently remove all your data."
//         confirmText="Delete"
//         cancelText="Cancel"
//         confirmVariant="danger"
//         open={showConfirmModal}
//         setOpen={setShowConfirmModal}
//         onConfirm={async () => {
//           try {
//             await deleteAccount();
//           } catch (error) {
//             console.error("Error deleting account:", error);
//           }
//         }}
//       />
//     </>
//   );
// };

// export default AccountSettingsSection;

"use client";

import React, { useState } from "react";
import LoaderComponent from "@/components/general/LoaderComponent";
import ProfileSettingRow from "@/components/profile/ProfileSettingRow";
import ConfirmationModal from "@/modals/ConfirmationModal";
import { useUid } from "@/hooks/useUid";
import { FaSignOutAlt, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/client";
import { signOut as fbSignOut } from "firebase/auth";

async function postJSON<T = any>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

const AccountSettingsSection = () => {
  const router = useRouter();
  const { loading } = useUid();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSignOut = async () => {
    try {
      // 1) Clear server session cookie
      await postJSON("/api/auth/sign-out");
      // 2) Sign out Firebase client (clears in-memory state)
      await fbSignOut(auth);
      toast.success("Signed out");
      router.push("/sign-in");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to sign out");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Server route should: verify session, delete user (Admin), purge user data, revoke refresh tokens, clear cookie
      await postJSON("/api/account/delete");
      // Also sign out client to fully reset local state
      await fbSignOut(auth);
      toast.success("Your account has been deleted.");
      router.push("/sign-in");
    } catch (e: any) {
      console.error("Error deleting account:", e);
      toast.error(e?.message || "Failed to delete account");
    } finally {
      setShowConfirmModal(false);
    }
  };

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
          onActionClick={handleSignOut}
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
        onConfirm={handleDeleteAccount}
      />
    </>
  );
};

export default AccountSettingsSection;
