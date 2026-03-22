'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { useInviteClient } from '@/hooks/useClients';
import { InviteClientFormData } from '@/types';
import { UserPlus, CheckCircle } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  goal: z.enum(
    ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness', 'flexibility', 'sport_performance'],
    { required_error: 'Please select a goal' }
  ),
  message: z.string().max(500).optional(),
});

const goalOptions = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'strength', label: 'Strength Training' },
  { value: 'endurance', label: 'Endurance / Cardio' },
  { value: 'general_fitness', label: 'General Fitness' },
  { value: 'flexibility', label: 'Flexibility & Mobility' },
  { value: 'sport_performance', label: 'Sport Performance' },
];

interface InviteClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteClientModal({ isOpen, onClose }: InviteClientModalProps) {
  const [success, setSuccess] = React.useState(false);
  const inviteClient = useInviteClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteClientFormData>({
    resolver: zodResolver(schema),
  });

  const handleClose = () => {
    reset();
    setSuccess(false);
    onClose();
  };

  const onSubmit = async (data: InviteClientFormData) => {
    try {
      await inviteClient.mutateAsync(data);
      setSuccess(true);
      reset();
    } catch (err) {
      console.error('Failed to invite client:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite New Client"
      description="Send an invitation email to onboard a new client to your roster."
      size="md"
    >
      {success ? (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="p-4 rounded-full bg-success-100 mb-4">
            <CheckCircle className="h-8 w-8 text-success-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Invitation Sent!</h3>
          <p className="text-sm text-slate-500 mt-1">
            Your client will receive an email with instructions to set up their account.
          </p>
          <Button className="mt-6" onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Client Name"
            placeholder="Jane Smith"
            required
            error={errors.name?.message}
            leftIcon={<UserPlus className="h-4 w-4" />}
            {...register('name')}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="jane@example.com"
            required
            error={errors.email?.message}
            {...register('email')}
          />
          <Select
            label="Primary Goal"
            placeholder="Select a goal..."
            required
            options={goalOptions}
            error={errors.goal?.message}
            {...register('goal')}
          />
          <Textarea
            label="Personal Message (Optional)"
            placeholder="Hi Jane! I'm excited to start working with you on your fitness journey..."
            rows={3}
            hint="This message will be included in the invitation email."
            {...register('message')}
          />

          {inviteClient.isError && (
            <p className="text-sm text-danger-600 bg-danger-50 px-3 py-2 rounded-lg">
              Failed to send invitation. Please try again.
            </p>
          )}

          <ModalFooter>
            <Button variant="outline" onClick={handleClose} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={inviteClient.isPending}>
              Send Invitation
            </Button>
          </ModalFooter>
        </form>
      )}
    </Modal>
  );
}

export default InviteClientModal;
