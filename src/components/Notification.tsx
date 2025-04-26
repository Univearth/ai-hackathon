import { Transition } from '@headlessui/react';
import {
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/20/solid';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Dispatch, Fragment, SetStateAction, useEffect } from 'react';

import { NotificationTypes } from '@/types/notification';

const Notification = (props: {
  setNotificationInfo: Dispatch<SetStateAction<NotificationTypes>>;
  notificationInfo: NotificationTypes;
}) => {
  const { setNotificationInfo, notificationInfo } = props;

  useEffect(() => {
    if (notificationInfo.open) {
      setTimeout(
        () => {
          setNotificationInfo({
            open: false,
            text: '',
            subText: '',
            type: 'none',
          });
        },
        notificationInfo.timeout ? notificationInfo.timeout : 5000,
      );
    }
  }, [notificationInfo.open, notificationInfo.timeout, setNotificationInfo]);

  return (
    <>
      <div
        aria-live="assertive"
        style={{ zIndex: 9999 }}
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          <Transition
            show={notificationInfo.open}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="shrink-0">
                    {notificationInfo.type === 'checked' ? (
                      <CheckCircleIcon
                        className="h-6 w-6 text-green-400"
                        aria-hidden="true"
                      />
                    ) : notificationInfo.type === 'warn' ? (
                      <ExclamationTriangleIcon
                        className="h-6 w-6 text-yellow-400"
                        aria-hidden="true"
                      />
                    ) : notificationInfo.type === 'danger' ? (
                      <XCircleIcon
                        className="h-6 w-6 text-red-400"
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {notificationInfo.text}
                    </p>
                    <p
                      className="mt-1 text-sm text-gray-500"
                      hidden={notificationInfo.subText === ''}
                    >
                      {notificationInfo.subText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
};

export default Notification;