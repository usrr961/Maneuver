import React from "react";
// import { toast } from "react-toastify";

/**
 * A component for updating the website, deleting all service workers and their
 * respective caches.
 *
 * @returns {JSX.Element} The rendered component.
 */
const SettingsUpdateButton = () => {
  /**
   * Clears all service workers and their caches.
   */
  const clearServiceWorkers = () => {
    // Get all the registrations of the service workers and loop through them
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        // Unregister the service worker
        registration.unregister();
      }
    });
    // Notify the user that the website has been updated
    // toast.success("Website Updated");
  };
  return (
    <>
      {/* Container for the update button */}
      <button
        type="button"
        className="flex w-fit h-fit items-center justify-center border-8 border-[#1D1E1E] rounded-xl bg-[#242424] p-4 text-white font-bold ~text-2xl/5xl text-center"
        onClick={clearServiceWorkers}
      >
          Update Website
      </button>
    </>
  );
};


export default SettingsUpdateButton;
