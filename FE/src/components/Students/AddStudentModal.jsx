import { useEffect, useRef, useState } from "react";
import Button from "../common/Button";

const AddStudentModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData, // { id, studentCode, full_name, image_url }
  mode = "create", // "create" | "edit"
}) => {
  const [msv, setMsv] = useState("");
  const [fullName, setFullName] = useState("");
  const [imageFile, setImageFile] = useState(null); // File | Blob | null
  const [previewUrl, setPreviewUrl] = useState("");
  const [tab, setTab] = useState("upload"); // "upload" | "webcam"

  // webcam refs/state
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [camReady, setCamReady] = useState(false);
  const [captured, setCaptured] = useState(false); // đã chụp 1 frame

  // Fill form khi mở
  useEffect(() => {
    if (!isOpen) return;
    if (initialData && mode === "edit") {
      setMsv(initialData.studentCode || "");
      setFullName(initialData.full_name || "");
      setImageFile(null);
      setPreviewUrl(initialData.image_url || "");
    } else {
      setMsv("");
      setFullName("");
      setImageFile(null);
      setPreviewUrl("");
    }
    setTab("upload");
    setCaptured(false);
  }, [isOpen, initialData, mode]);

  // Cleanup camera khi đóng
  useEffect(() => {
    const stopCam = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCamReady(false);
    };
    if (!isOpen) stopCam();
    return stopCam;
  }, [isOpen]);

  // Mở camera khi chuyển tab webcam
  useEffect(() => {
    if (!isOpen || tab !== "webcam") return;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCamReady(true);
        }
      } catch (e) {
        setCamReady(false);
        console.error("getUserMedia error:", e);
        alert(
          "Không truy cập được webcam. Hãy kiểm tra quyền camera (HTTPS/localhost)."
        );
      }
    })();
  }, [isOpen, tab]);

  // Upload file: tạo preview
  const handlePickImage = (e) => {
    const f = e.target.files?.[0];
    setImageFile(f || null);
    setCaptured(false);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else if (initialData?.image_url && mode === "edit") {
      setPreviewUrl(initialData.image_url);
    } else {
      setPreviewUrl("");
    }
  };

  // Chụp 1 frame từ webcam -> Blob
  const handleCapture = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // chuyển canvas -> Blob (jpeg)
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setImageFile(blob); // Blob sẽ được FE bọc thành File trong toFormData (đã có)
        setPreviewUrl(URL.createObjectURL(blob));
        setCaptured(true);
      },
      "image/jpeg",
      0.92
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      msv: msv.trim(),
      full_name: fullName.trim(),
      ...(imageFile ? { imageFile } : {}), // edit có thể không gửi ảnh
    };
    onSubmit?.(payload);
  };

  const canSubmit =
    msv.trim() &&
    fullName.trim() &&
    (mode === "edit" ? true : Boolean(imageFile)); // tạo mới bắt buộc có ảnh

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {mode === "edit" ? "Sửa thông tin sinh viên" : "Thêm sinh viên"}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={`px-3 py-1.5 rounded-lg border text-sm ${
                tab === "upload" ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              Upload ảnh
            </button>
            <button
              type="button"
              onClick={() => setTab("webcam")}
              className={`px-3 py-1.5 rounded-lg border text-sm ${
                tab === "webcam" ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              Chụp từ webcam
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">MSV</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={msv}
                onChange={(e) => setMsv(e.target.value)}
                placeholder="VD: 20231234"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Họ và tên
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
          </div>

          {/* Khu vực ảnh */}
          {tab === "upload" ? (
            <div>
              <label className="block text-sm font-medium mb-1">
                Ảnh chân dung{" "}
                {mode === "edit" && (
                  <span className="text-gray-500">
                    (để trống nếu giữ ảnh cũ)
                  </span>
                )}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePickImage}
                className="block w-full text-sm"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Webcam</label>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="border rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-[320px] h-[240px] bg-black"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCapture}
                    disabled={!camReady}
                  >
                    {captured ? "Chụp lại" : "Chụp ảnh"}
                  </Button>
                  {!camReady && (
                    <p className="text-xs text-gray-500 max-w-xs">
                      Lưu ý: cần chạy trên HTTPS hoặc{" "}
                      <code>http://localhost</code> để dùng webcam.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="preview"
              className="mt-2 w-32 h-32 object-cover rounded-lg border"
            />
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                // tắt cam trước khi đóng
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach((t) => t.stop());
                  streamRef.current = null;
                }
                onClose?.();
              }}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={!canSubmit}>
              {mode === "edit" ? "Lưu thay đổi" : "Thêm mới"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
