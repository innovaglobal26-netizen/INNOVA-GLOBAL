import { SiteSettings } from '../types';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  website_name: 'INNOVA.GLOBAL',
  tagline: 'CONNECT • LEARN • GROW',
  support_number: '01313213083',
  bkash_number: '01313213083',
  nagad_number: '01313213083',
  telegram_group: 'https://t.me/+kOclYClnM0NmYzc1',
  telegram_channel: 'https://t.me/powernetwork7xofficialchannel',
  youtube_channel: 'https://www.youtube.com/@PowerNetwork7X',
  support_telegram: 'https://t.me/PARVEZ_OWNER_7X',
  min_withdrawal_amount: 300,
  activation_fee: 200,
  referral_reward_amount: 30,
  withdrawal_wait_minutes: 10,
};

export const ROOT_ADMIN_INNOVA_ID = '000001';
export const ROOT_ADMIN_MOBILE = '01313213083';

export const INITIAL_PACKAGES = [
  {
    id: 'pkg-starter',
    name: 'STARTER',
    price: 200,
    duration_days: 15,
    tasks_per_day: 12,
    task_duration_seconds: 20,
    daily_reward: 50,
    is_active: true,
    description: 'Entry gateway to digital engagement, daily 12 verified micro-tasks with ৳50 daily reward allocation.',
  },
  {
    id: 'pkg-plus',
    name: 'PLUS',
    price: 300,
    duration_days: 15,
    tasks_per_day: 12,
    task_duration_seconds: 20,
    daily_reward: 100,
    is_active: true,
    description: 'Enhanced tier for consistent network contributors with double reward rate and priority validation.',
  },
  {
    id: 'pkg-pro',
    name: 'PRO',
    price: 400,
    duration_days: 15,
    tasks_per_day: 12,
    task_duration_seconds: 20,
    daily_reward: 150,
    is_active: true,
    description: 'Premier network grade with maximum task yields, highest tier recognition and instant processing.',
  },
];
