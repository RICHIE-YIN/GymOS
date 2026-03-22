'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn, getInitials, getAvatarColor } from '@/lib/utils';
import {
  User,
  CreditCard,
  Bell,
  Shield,
  Camera,
  Plus,
  X,
  Check,
  DollarSign,
  Clock,
  Dumbbell,
} from 'lucide-react';

type SettingsTab = 'profile' | 'billing' | 'notifications' | 'security';

const SETTINGS_TABS: { value: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { value: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  { value: 'billing', label: 'Pricing & Plans', icon: <CreditCard className="h-4 w-4" /> },
  { value: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { value: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
];

const SPECIALTIES = [
  'Weight Loss', 'Muscle Gain', 'Strength Training', 'Powerlifting', 'Bodybuilding',
  'HIIT', 'Yoga', 'Pilates', 'CrossFit', 'Calisthenics', 'Endurance', 'Sport Performance',
  'Rehabilitation', 'Senior Fitness', 'Pre/Postnatal',
];

function ToggleSetting({
  label,
  description,
  defaultValue = false,
}: {
  label: string;
  description: string;
  defaultValue?: boolean;
}) {
  const [enabled, setEnabled] = useState(defaultValue);
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-slate-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 shrink-0',
          enabled ? 'bg-brand-600' : 'bg-slate-200'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { trainer } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [specialties, setSpecialties] = useState(['Weight Loss', 'Strength Training', 'HIIT']);
  const [certifications, setCertifications] = useState([
    'NASM CPT',
    'CSCS (NSCA)',
    'Precision Nutrition Level 1',
  ]);
  const [newCert, setNewCert] = useState('');
  const [saved, setSaved] = useState(false);

  const addCert = () => {
    if (newCert.trim()) {
      setCertifications([...certifications, newCert.trim()]);
      setNewCert('');
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleSpecialty = (spec: string) => {
    setSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  return (
    <div className="page-container max-w-5xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage your trainer profile and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-52 shrink-0">
          <nav className="space-y-1">
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors',
                  activeTab === tab.value
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <span className={cn(activeTab === tab.value ? 'text-brand-600' : 'text-slate-400')}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <>
              {/* Profile photo */}
              <Card>
                <h3 className="font-semibold text-slate-900 mb-4">Profile Photo</h3>
                <div className="flex items-center gap-5">
                  <div className="relative">
                    {trainer?.avatarUrl ? (
                      <img
                        src={trainer.avatarUrl}
                        alt={trainer.name}
                        className="h-20 w-20 rounded-2xl object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          'h-20 w-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold',
                          trainer ? getAvatarColor(trainer.name) : 'bg-brand-600'
                        )}
                      >
                        {trainer ? getInitials(trainer.name) : 'T'}
                      </div>
                    )}
                    <button className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-lg shadow border border-slate-200 text-slate-600 hover:text-brand-600 transition-colors">
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{trainer?.name || 'Trainer Name'}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{trainer?.email}</p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm">Upload Photo</Button>
                      <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Basic info */}
              <Card>
                <h3 className="font-semibold text-slate-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Full Name" defaultValue={trainer?.name || ''} placeholder="Your full name" />
                    <Input label="Email Address" type="email" defaultValue={trainer?.email || ''} disabled />
                  </div>
                  <Input label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" />
                  <Textarea
                    label="Bio"
                    placeholder="Tell clients about your training philosophy and approach..."
                    rows={4}
                    defaultValue="I'm a certified personal trainer with 8 years of experience helping clients achieve their fitness goals. I specialize in strength training and body recomposition."
                  />
                </div>
              </Card>

              {/* Specialties */}
              <Card>
                <h3 className="font-semibold text-slate-900 mb-1">Specialties</h3>
                <p className="text-sm text-slate-500 mb-4">Select your areas of expertise</p>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => toggleSpecialty(spec)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                        specialties.includes(spec)
                          ? 'bg-brand-600 border-brand-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
                      )}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Certifications */}
              <Card>
                <h3 className="font-semibold text-slate-900 mb-4">Certifications</h3>
                <div className="space-y-2 mb-4">
                  {certifications.map((cert) => (
                    <div key={cert} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                      <Dumbbell className="h-4 w-4 text-brand-600 shrink-0" />
                      <span className="text-sm text-slate-700 flex-1">{cert}</span>
                      <button
                        onClick={() => setCertifications(certifications.filter((c) => c !== cert))}
                        className="text-slate-400 hover:text-danger-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add certification (e.g., NASM CPT)"
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCert()}
                  />
                  <Button variant="outline" onClick={addCert} leftIcon={<Plus className="h-4 w-4" />}>
                    Add
                  </Button>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} leftIcon={saved ? <Check className="h-4 w-4" /> : undefined}>
                  {saved ? 'Saved!' : 'Save Changes'}
                </Button>
              </div>
            </>
          )}

          {activeTab === 'billing' && (
            <>
              {/* Current plan */}
              <Card className="border-brand-200 bg-brand-50">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="primary" className="mb-2">Current Plan</Badge>
                    <h3 className="text-lg font-bold text-slate-900">GymOS Pro</h3>
                    <p className="text-slate-600 text-sm mt-1">Up to 30 clients · All features</p>
                    <p className="text-2xl font-bold text-brand-600 mt-3">$79<span className="text-base font-normal text-slate-500">/month</span></p>
                  </div>
                  <Badge variant="success" dot>Active</Badge>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-200">
                  <p className="text-sm text-slate-600">Next billing date: April 22, 2026</p>
                </div>
              </Card>

              {/* Available plans */}
              <Card>
                <h3 className="font-semibold text-slate-900 mb-4">Available Plans</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Starter', price: '$39', clients: '10 clients', features: ['Core features', 'Basic analytics', 'Email support'] },
                    { name: 'Pro', price: '$79', clients: '30 clients', features: ['All features', 'Advanced analytics', 'Priority support', 'AI program generation'], current: true },
                    { name: 'Elite', price: '$149', clients: 'Unlimited clients', features: ['Everything in Pro', 'White-label app', 'Revenue tracking', 'Dedicated support'] },
                  ].map((plan) => (
                    <div
                      key={plan.name}
                      className={cn(
                        'flex items-start gap-4 p-4 rounded-xl border-2 transition-all',
                        plan.current ? 'border-brand-600 bg-brand-50' : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{plan.name}</p>
                          {plan.current && <Badge variant="primary" size="sm">Current</Badge>}
                        </div>
                        <p className="text-sm text-slate-500">{plan.clients}</p>
                        <ul className="mt-2 space-y-1">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Check className="h-3.5 w-3.5 text-success-500" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-slate-900">{plan.price}</p>
                        <p className="text-xs text-slate-500">/month</p>
                        {!plan.current && (
                          <Button variant="outline" size="sm" className="mt-2">
                            Switch
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Payment method */}
              <Card>
                <h3 className="font-semibold text-slate-900 mb-4">Payment Method</h3>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-4">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <CreditCard className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Visa ending in 4242</p>
                    <p className="text-xs text-slate-500">Expires 12/2027</p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto">Update</Button>
                </div>
                <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                  Add Payment Method
                </Button>
              </Card>
            </>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h3 className="font-semibold text-slate-900 mb-1">Notification Preferences</h3>
              <p className="text-sm text-slate-500 mb-6">Choose how you want to be notified</p>

              <div className="space-y-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Client Activity</p>
                <ToggleSetting label="Client Check-in Submitted" description="When a client submits their weekly check-in" defaultValue={true} />
                <ToggleSetting label="Workout Completed" description="When a client logs a completed workout" defaultValue={false} />
                <ToggleSetting label="Client Hasn't Logged In" description="Alert when a client is inactive for 7+ days" defaultValue={true} />
                <ToggleSetting label="New Client Joined" description="When a client accepts your invitation" defaultValue={true} />

                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6">Messages</p>
                <ToggleSetting label="New Message" description="Push notification for new client messages" defaultValue={true} />
                <ToggleSetting label="Email Digest" description="Daily summary of messages (if unread)" defaultValue={true} />

                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6">Platform</p>
                <ToggleSetting label="Product Updates" description="New features and improvements to GymOS" defaultValue={true} />
                <ToggleSetting label="Marketing Emails" description="Tips, webinars, and training resources" defaultValue={false} />
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
                <Button onClick={handleSave}>Save Preferences</Button>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <>
              <Card>
                <h3 className="font-semibold text-slate-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <Input label="Current Password" type="password" placeholder="Enter current password" />
                  <Input label="New Password" type="password" placeholder="Enter new password" hint="At least 8 characters with a mix of letters and numbers." />
                  <Input label="Confirm New Password" type="password" placeholder="Confirm new password" />
                  <Button>Update Password</Button>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-slate-900 mb-1">Two-Factor Authentication</h3>
                <p className="text-sm text-slate-500 mb-4">Add an extra layer of security to your account</p>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                  <Shield className="h-6 w-6 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Authenticator App</p>
                    <p className="text-xs text-slate-500">Use Google Authenticator or similar</p>
                  </div>
                  <Badge variant="default">Not enabled</Badge>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </Card>

              <Card>
                <h3 className="font-semibold text-slate-900 mb-1 text-danger-600">Danger Zone</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Permanently delete your trainer account and all associated data.
                </p>
                <Button variant="danger" size="sm">Delete Account</Button>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
