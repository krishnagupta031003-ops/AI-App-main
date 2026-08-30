"use client";

/**
 * Account Page
 * User profile and account settings
 */

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { authAPI } from "../../../lib/api";
import Card, {
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Avatar from "../../../components/ui/Avatar";
import Modal, { ModalFooter } from "../../../components/ui/Modal";
import { formatDate, cn } from "../../../lib/utils";

export default function AccountPage() {
    const { user, updateProfile, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otpAction, setOTPAction] = useState(null); // 'password', 'delete', 'email'
    const [pendingEmailUpdate, setPendingEmailUpdate] = useState(null);
    const [otpRequestLoading, setOtpRequestLoading] = useState(false);
    const [otpRequestError, setOtpRequestError] = useState("");

    const handlePasswordClick = async () => {
        setOTPAction("password");
        setOtpRequestLoading(true);
        setOtpRequestError("");

        try {
            const result = await authAPI.requestOTP("password_change");

            if (result.success) {
                setOtpRequestLoading(false);
                setShowOTPModal(true);
            } else {
                setOtpRequestLoading(false);
                setOTPAction(null);
                setOtpRequestError(result.message || "Failed to send OTP");
            }
        } catch (err) {
            setOtpRequestLoading(false);
            setOTPAction(null);
            setOtpRequestError(
                err.message || "Failed to send OTP. Please try again.",
            );
        }
    };

    const handleDeleteClick = async () => {
        setOTPAction("delete");
        setOtpRequestLoading(true);
        setOtpRequestError("");

        try {
            const result = await authAPI.requestOTP("account_delete");

            if (result.success) {
                setOtpRequestLoading(false);
                setShowOTPModal(true);
            } else {
                setOtpRequestLoading(false);
                setOTPAction(null);
                setOtpRequestError(result.message || "Failed to send OTP");
            }
        } catch (err) {
            setOtpRequestLoading(false);
            setOTPAction(null);
            setOtpRequestError(
                err.message || "Failed to send OTP. Please try again.",
            );
        }
    };

    const handleEmailUpdate = async (emailData) => {
        setPendingEmailUpdate(emailData);
        setOTPAction("email");
        setOtpRequestLoading(true);
        setOtpRequestError("");

        try {
            const result = await authAPI.requestOTP("email_update");

            if (result.success) {
                setOtpRequestLoading(false);
                setShowOTPModal(true);
            } else {
                setOtpRequestLoading(false);
                setOTPAction(null);
                setOtpRequestError(result.message || "Failed to send OTP");
                setPendingEmailUpdate(null);
            }
        } catch (err) {
            setOtpRequestLoading(false);
            setOTPAction(null);
            setOtpRequestError(
                err.message || "Failed to send OTP. Please try again.",
            );
            setPendingEmailUpdate(null);
        }
    };

    const handleOTPVerified = () => {
        setShowOTPModal(false);

        if (otpAction === "password") {
            setShowPasswordModal(true);
        } else if (otpAction === "delete") {
            setShowDeleteModal(true);
        } else if (otpAction === "email" && pendingEmailUpdate) {
            updateProfile(pendingEmailUpdate).then(() => {
                setPendingEmailUpdate(null);
                setIsEditing(false);
            });
        }

        setOTPAction(null);
    };

    const handleOTPClose = () => {
        setShowOTPModal(false);
        setOTPAction(null);
        setPendingEmailUpdate(null);
    };

    return (
        <>
            <div className="h-full overflow-y-auto bg-transparent">
                <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
                    <section className="rounded-[28px] border border-slate-200 bg-white/60 dark:border-white/10 dark:bg-white/5 p-6 shadow-[0_18px_60px_rgba(2,6,23,0.16)] backdrop-blur-xl sm:p-8">
                        <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">
                            Profile settings
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                            Account Settings
                        </h1>
                        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                            Manage your profile, security, and subscription
                            details from one clean workspace.
                        </p>
                    </section>

                    <ProfileSection
                        user={user}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        updateProfile={updateProfile}
                        onEmailUpdate={handleEmailUpdate}
                    />

                    <div className="grid gap-6 lg:grid-cols-2">
                        <SecuritySection
                            onChangePassword={handlePasswordClick}
                        />
                        <AccountInfoSection user={user} />
                    </div>

                    <DangerZoneSection onDeleteAccount={handleDeleteClick} />
                </div>
            </div>

            <OTPVerificationModal
                isOpen={showOTPModal}
                onClose={handleOTPClose}
                onVerified={handleOTPVerified}
                email={user?.email}
                action={otpAction}
            />

            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />

            <DeleteAccountModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={logout}
                email={user?.email}
            />
        </>
    );
}

function ProfileSection({
    user,
    isEditing,
    setIsEditing,
    updateProfile,
    onEmailUpdate,
}) {
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async () => {
        setLoading(true);
        setError("");

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email.trim())) {
            setError("Please enter a valid email address");
            setLoading(false);
            return;
        }

        // Validate name is not empty
        if (!formData.name || !formData.name.trim()) {
            setError("Name cannot be empty");
            setLoading(false);
            return;
        }

        // Check if email changed - require OTP verification
        if (formData.email !== user?.email) {
            setLoading(false);
            onEmailUpdate(formData);
            return;
        }

        // Only name changed - update directly
        const result = await updateProfile(formData);

        if (result.success) {
            setIsEditing(false);
        } else {
            setError(result.error || "Failed to update profile");
        }

        setLoading(false);
    };

    const handleCancel = () => {
        setFormData({ name: user?.name || "", email: user?.email || "" });
        setIsEditing(false);
        setError("");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col gap-6 lg:flex-row">
                    <Avatar name={user?.name} size="2xl" />

                    <div className="flex-1 space-y-4">
                        {error && (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
                                <p className="text-sm text-rose-700 dark:text-rose-200">
                                    {error}
                                </p>
                            </div>
                        )}

                        {isEditing ? (
                            <>
                                <Input
                                    label="Name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    disabled={loading}
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    disabled={loading}
                                />
                            </>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <InfoRow label="Name" value={user?.name} />
                                <InfoRow label="Email" value={user?.email} />
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                {isEditing ? (
                    <>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="gradient-primary text-white px-6 py-3 rounded-xl shadow-lg font-medium hover:opacity-90 transition inline-flex items-center justify-center gap-2"
                        >
                            {loading && (
                                <svg
                                    className="animate-spin h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            )}
                            Save changes
                        </button>
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit profile
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

function SecuritySection({ onChangePassword }) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                    Manage your password and security settings
                </CardDescription>
            </CardHeader>

            <CardContent>
                <InfoRow label="Password" value="********" />
            </CardContent>

            <CardFooter>
                <Button variant="outline" onClick={onChangePassword}>
                    Change password
                </Button>
            </CardFooter>
        </Card>
    );
}

function AccountInfoSection({ user }) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Details about your account</CardDescription>
            </CardHeader>

            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                    <InfoRow
                        label="Account Type"
                        value={user?.role || "User"}
                    />
                    <InfoRow
                        label="Member Since"
                        value={formatDate(user?.createdAt)}
                    />
                    <div className="sm:col-span-2">
                        <InfoRow
                            label="Last Login"
                            value={formatDate(user?.lastLogin)}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function DangerZoneSection({ onDeleteAccount }) {
    return (
        <Card className="border-rose-200/80 bg-rose-50/60 dark:border-rose-900/40 dark:bg-rose-950/20">
            <CardHeader>
                <CardTitle className="text-rose-600 dark:text-rose-300">
                    Danger Zone
                </CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>

            <CardContent>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Once you delete your account, there is no going back. Please
                    be certain.
                </p>
            </CardContent>

            <CardFooter>
                <Button variant="danger" onClick={onDeleteAccount}>
                    Delete account
                </Button>
            </CardFooter>
        </Card>
    );
}

function ChangePasswordModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setError("");
            setShowCurrent(false);
            setShowNew(false);
            setShowConfirm(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.currentPassword) {
            setError("Current password is required");
            return;
        }

        if (formData.newPassword.length < 6) {
            setError("New password must be at least 6 characters");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        setLoading(true);
        const { resetPassword } = useAuth();
        try {
            const result = await resetPassword(
                formData.currentPassword,
                formData.newPassword,
            );
            if (result.success) {
                onClose();
            } else {
                setError(result.error || "Failed to change password");
            }
        } catch (err) {
            setError(err.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    const isMinLength = formData.newPassword.length >= 6;
    const isMatch =
        formData.newPassword === formData.confirmPassword &&
        formData.confirmPassword !== "";
    const canSubmit = isMinLength && isMatch && formData.currentPassword !== "";

    const passwordToggle = (showState, setter) => (
        <button
            type="button"
            onClick={() => setter(!showState)}
            className="p-1 text-slate-400 hover:text-white transition-colors focus:outline-none"
        >
            {showState ? (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                </svg>
            ) : (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                </svg>
            )}
        </button>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Change Password"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
                        <div className="flex items-center gap-3">
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-rose-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                            <p className="text-sm font-medium text-rose-200">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                <Input
                    label="Current Password"
                    type={showCurrent ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            currentPassword: e.target.value,
                        })
                    }
                    required
                    disabled={loading}
                    rightIcon={passwordToggle(showCurrent, setShowCurrent)}
                />

                <Input
                    label="New Password"
                    type={showNew ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            newPassword: e.target.value,
                        })
                    }
                    required
                    disabled={loading}
                    rightIcon={passwordToggle(showNew, setShowNew)}
                />

                <Input
                    label="Confirm New Password"
                    type={showConfirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                        })
                    }
                    required
                    disabled={loading}
                    rightIcon={passwordToggle(showConfirm, setShowConfirm)}
                />

                {/* Requirements Checklist */}
                <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-2.5">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
                        Password Suffix Checks
                    </p>
                    <div className="flex items-center gap-2">
                        {isMinLength ? (
                            <svg
                                className="h-4 w-4 text-cyan-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-600 ml-1.5 mr-1" />
                        )}
                        <span
                            className={cn(
                                "text-xs transition-colors",
                                isMinLength
                                    ? "text-cyan-300 font-medium"
                                    : "text-slate-500",
                            )}
                        >
                            Must be at least 6 characters
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isMatch ? (
                            <svg
                                className="h-4 w-4 text-cyan-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-600 ml-1.5 mr-1" />
                        )}
                        <span
                            className={cn(
                                "text-xs transition-colors",
                                isMatch
                                    ? "text-cyan-300 font-medium"
                                    : "text-slate-500",
                            )}
                        >
                            Passwords must match exactly
                        </span>
                    </div>
                </div>

                <ModalFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="gradient-primary text-white px-6 py-3 rounded-xl shadow-lg font-medium hover:opacity-90 transition inline-flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <svg
                                className="animate-spin h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        )}
                        Update Password
                    </button>
                </ModalFooter>
            </form>
        </Modal>
    );
}

function DeleteAccountModal({ isOpen, onClose, onConfirm, email }) {
    const [confirmText, setConfirmText] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setConfirmText("");
        }
    }, [isOpen]);

    const handleDelete = async () => {
        if (confirmText !== "DELETE") return;

        setLoading(true);
        setTimeout(() => {
            onConfirm();
        }, 1000);
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Delete Account"
            size="md"
        >
            <div className="space-y-6">
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 relative overflow-hidden">
                    {/* Subtle red background glow */}
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl" />

                    <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-rose-500/10 p-2 text-rose-400">
                            <svg
                                className="h-6 w-6 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-rose-300">
                                Warning: This action is permanent
                            </h3>
                            <p className="text-xs text-rose-300/70 leading-relaxed mt-1">
                                Once you delete your account, your profile,
                                active sessions, saved configurations, and all
                                messages history will be permanently deleted.
                                There is no way to undo this.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-900/40 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Account to Delete
                    </p>
                    <p className="text-sm text-slate-950 dark:text-slate-200 font-medium mt-1">
                        {email}
                    </p>
                </div>

                <div className="space-y-2.5">
                    <p className="text-xs text-slate-400">
                        To proceed, type{" "}
                        <span className="font-semibold text-rose-300 font-mono bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                            DELETE
                        </span>{" "}
                        in the box below to confirm:
                    </p>
                    <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="DELETE"
                        disabled={loading}
                        inputClassName="text-center font-mono font-bold tracking-widest placeholder:font-sans placeholder:tracking-normal"
                    />
                </div>

                <ModalFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        disabled={confirmText !== "DELETE" || loading}
                        loading={loading}
                        className="shadow-[0_4px_16px_rgba(244,63,94,0.2)] hover:shadow-[0_4px_24px_rgba(244,63,94,0.35)] transition-all"
                    >
                        Permanently Delete
                    </Button>
                </ModalFooter>
            </div>
        </Modal>
    );
}

function OTPVerificationModal({ isOpen, onClose, onVerified, email, action }) {
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState("");

    const inputRefs = useRef([]);

    // Clear inputs when modal opens
    useEffect(() => {
        if (isOpen) {
            setOtpDigits(["", "", "", "", "", ""]);
            setError("");
            setResendMessage("");
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [isOpen]);

    const actionTitles = {
        password: "Verify OTP to Change Password",
        delete: "Verify OTP to Delete Account",
        email: "Verify OTP to Update Email",
    };

    const actionDescriptions = {
        password:
            "Enter the verification code sent to your email to proceed with password change",
        delete: "Enter the verification code sent to your email to proceed with account deletion",
        email: "Enter the verification code sent to your email to proceed with email update",
    };

    const handleChange = (index, value) => {
        const cleanValue = value.replace(/\D/g, "");
        if (!cleanValue) {
            const newDigits = [...otpDigits];
            newDigits[index] = "";
            setOtpDigits(newDigits);
            return;
        }

        const digit = cleanValue[cleanValue.length - 1];
        const newDigits = [...otpDigits];
        newDigits[index] = digit;
        setOtpDigits(newDigits);
        setError("");

        // Focus next input
        if (index < 5 && digit) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (!otpDigits[index] && index > 0) {
                const newDigits = [...otpDigits];
                newDigits[index - 1] = "";
                setOtpDigits(newDigits);
                inputRefs.current[index - 1]?.focus();
            } else if (otpDigits[index]) {
                const newDigits = [...otpDigits];
                newDigits[index] = "";
                setOtpDigits(newDigits);
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);
        if (pastedData.length > 0) {
            const newDigits = [...otpDigits];
            for (let i = 0; i < 6; i++) {
                newDigits[i] = pastedData[i] || "";
            }
            setOtpDigits(newDigits);
            setError("");
            const targetFocus = Math.min(pastedData.length, 5);
            inputRefs.current[targetFocus]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const otp = otpDigits.join("");
        if (otp.length !== 6) {
            setError("Please enter a 6-digit OTP");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Map action to backend purpose
            const purposeMap = {
                password: "password_change",
                delete: "account_delete",
                email: "email_update",
            };
            const purpose = purposeMap[action] || action;

            const result = await authAPI.verifyOTP(purpose, otp);

            if (result.success) {
                setLoading(false);
                onVerified();
            } else {
                setLoading(false);
                setError(result.message || "Invalid OTP. Please try again.");
            }
        } catch (err) {
            setLoading(false);
            setError(err.message || "Failed to verify OTP. Please try again.");
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setResendMessage("");
        setError("");

        try {
            // Map action to backend purpose
            const purposeMap = {
                password: "password_change",
                delete: "account_delete",
                email: "email_update",
            };
            const purpose = purposeMap[action] || action;

            const result = await authAPI.requestOTP(purpose);

            if (result.success) {
                setResendLoading(false);
                setResendMessage("OTP sent successfully");
                setOtpDigits(["", "", "", "", "", ""]);
                setTimeout(() => inputRefs.current[0]?.focus(), 50);
                setTimeout(() => setResendMessage(""), 3000);
            } else {
                setResendLoading(false);
                setError(result.message || "Failed to resend OTP");
            }
        } catch (err) {
            setResendLoading(false);
            setError(err.message || "Failed to resend OTP. Please try again.");
        }
    };

    const handleClose = () => {
        setError("");
        setResendMessage("");
        onClose();
    };

    const isOtpComplete = otpDigits.every((d) => d !== "");

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={actionTitles[action]}
            description={actionDescriptions[action]}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-rose-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                            <p className="text-sm font-medium text-rose-200">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {resendMessage && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-emerald-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-sm font-medium text-emerald-200">
                                {resendMessage}
                            </p>
                        </div>
                    </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-white/5 p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                            Sent To Email
                        </p>
                        <p className="text-sm text-slate-950 dark:text-slate-200 font-medium mt-1">
                            {email}
                        </p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Security Code
                    </label>

                    <div
                        className="flex items-center justify-between gap-2.5 sm:gap-3"
                        onPaste={handlePaste}
                    >
                        {otpDigits.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                value={digit}
                                onChange={(e) =>
                                    handleChange(index, e.target.value)
                                }
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={loading}
                                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-2xl border bg-white dark:bg-slate-900/60 border-slate-300 dark:border-slate-700/80 text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-150 disabled:opacity-50"
                                maxLength={1}
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                        ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        Please check your inbox or spam folder for a 6-digit
                        confirmation code.
                    </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendLoading || loading}
                        className="text-sm font-medium text-cyan-400 hover:text-cyan-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {resendLoading ? "Sending..." : "Resend OTP"}
                    </button>
                    <p className="text-xs text-slate-600 dark:text-slate-500 italic">
                        Demo: Any 6 digits work
                    </p>
                </div>

                <ModalFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <button
                        type="submit"
                        disabled={!isOtpComplete}
                        className="gradient-primary text-white px-6 py-3 rounded-xl shadow-lg font-medium hover:opacity-90 transition inline-flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <svg
                                className="animate-spin h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        )}
                        Verify Code
                    </button>
                </ModalFooter>
            </form>
        </Modal>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                {label}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}
