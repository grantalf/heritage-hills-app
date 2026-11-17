/**
 * The one switch for the draft's stand-ins (block 5 review, S-09, S-10, S-11, S-25).
 *
 * While `demo` is true (app.json, `expo.extra.demo`), the app runs on sample data with
 * a pretend sign-in, a role picker, a pretend second reporter and a pretend second
 * officer, and shows the Game workshop. None of that may reach residents.
 *
 * A store or public web build must set `extra.demo` to false. Until a real backend
 * replaces the sample data (HANDOVER.md, T-10), such a build stops at start-up on
 * purpose, so a draft can never ship by accident.
 */
import Constants from 'expo-constants';

export const DEMO: boolean = Constants.expoConfig?.extra?.demo === true;

export const NOT_READY_MESSAGE =
  'This build has demo mode turned off, but the real backend is not built yet. Set expo.extra.demo to true for a preview build, or connect the real repository (HANDOVER.md, T-10).';
