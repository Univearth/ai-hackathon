'use client';

import Notification from '@/components/Notification';
import { theme } from '@/theme/theme';
import { NotificationTypes } from '@/types/notification';
import {
  ArrowPathIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { ConfigProvider, GetProp, Modal, Upload, UploadProps } from 'antd';
import { UploadChangeParam, UploadFile } from 'antd/es/upload/index';
import { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const Receipt = () => {
  const camera = useRef<Webcam>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceNumber, setDeviceNumber] = useState(0);
  const [confirmImg, setConfirmImg] = useState(false);
  const [image, setImage] = useState('');
  const [fileSelected, setFileSelected] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isPDF, setIsPDF] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    'environment',
  );
  const capture = useCallback(() => {
    const imgSrc = camera.current?.getScreenshot();
    if (imgSrc) {
      setImage(imgSrc);
      setConfirmImg(true);
    }
  }, [camera]);

  const [notificationInfo, setNotificationInfo] = useState<NotificationTypes>({
    open: false,
    text: '',
    subText: '',
    type: 'none',
  });



  const handleChangeCamera = () => {
    // カメラが複数あるときはdeviceNumberを変更し、1つしかないときはfacingModeを切り替える
    if (devices.length !== 1) {
      setDeviceNumber((prev) => {
        if (prev === devices.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    } else {
      setFacingMode((prev) => {
        if (prev === 'user') {
          return 'environment';
        }
        return 'user';
      });
    }
  };

  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleUpload = async (file: UploadChangeParam<UploadFile<any>>) => {
    setFileList(file.fileList);
    const uploadFile = file.file;
    if (!uploadFile.url && !uploadFile.preview) {
      uploadFile.preview = await getBase64(
        uploadFile.originFileObj as FileType,
      );
      if (uploadFile.preview.startsWith('data:application/pdf')) {
        setIsPDF(true);
      }
      setImage(uploadFile.preview);
    }
    setFileSelected(true);
    setConfirmImg(true);
  };

  const handleSubmit = async () => {
    setNotificationInfo({
      open: true,
      text: '送信中...',
      subText: 'ファイルを送信しています。',
      type: 'none',
      timeout: 10000000000,
    });

    try {
      const formData = new FormData();
      const blob = await fetch(image).then(r => r.blob());
      formData.append('file', blob, 'image.jpg');

      const response = await fetch('/api/expiration', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'APIリクエストに失敗しました');
      }
      const data = await response.json();
      setNotificationInfo({
        open: true,
        text: '送信成功',
        subText: `商品名: ${data.name}\n期限: ${data.expiration_date}\n分量: ${data.amount}${data.unit}`,
        type: 'checked',
      });
    } catch (e) {
      console.error('Error in handleSubmit:', e);
      setNotificationInfo({
        open: true,
        text: '送信失敗',
        subText: e instanceof Error ? e.message : 'ファイルの送信に失敗しました。インターネット環境を確認してください。',
        type: 'danger',
      });
    }
  };



  return (
    <ConfigProvider theme={theme}>
      <div className="relative h-screen w-screen">
        {!confirmImg ? (
          <Webcam
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
            screenshotFormat="image/png"
            audio={false}
            ref={camera}
            videoConstraints={{
              facingMode: facingMode,
              deviceId: devices[deviceNumber]?.deviceId,
            }}
          />
        ) : (
          !isPDF && <img src={image} alt="写真" className="w-full h-full object-contain" />
        )}
        {!fileSelected && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex justify-center items-center gap-6 z-10">
            <Upload
              accept="application/pdf,image/*"
              fileList={fileList}
              onChange={handleUpload}
            >
              <button className="p-3 w-[4rem] h-[4rem] bg-gray-300 rounded-full text-center flex items-center justify-center">
                <ArrowUpTrayIcon className="text-white" />
              </button>
            </Upload>
            <button
              className="border-gray-300 w-[6rem] h-[6rem] bg-white border-[8px] text-center rounded-full flex items-center justify-center"
              onClick={capture}
            ></button>
            <button
              className="p-3 w-[4rem] h-[4rem] bg-gray-300 rounded-full text-center flex items-center justify-center"
              onClick={handleChangeCamera}
            >
              <ArrowPathIcon className="text-white" />
            </button>
          </div>
        )}
        <Modal
          open={confirmImg}
          okText={'送信'}
          cancelText={'キャンセル'}
          onOk={() => handleSubmit()}
          onCancel={() => {
            setConfirmImg(false);
            setFileList([]);
            setFileSelected(false);
          }}
        >
          {isPDF ? (
            <p className="text-center mb-2">
              選択されたPDFファイルを送信しますか？
            </p>
          ) : (
            <>
              <p className="text-center mb-2">この画像を送信しますか？</p>
              <img src={image} alt="写真" />
            </>
          )}
        </Modal>
        <Notification
          setNotificationInfo={setNotificationInfo}
          notificationInfo={notificationInfo}
        />
      </div>
    </ConfigProvider>
  );
};

export default Receipt;
