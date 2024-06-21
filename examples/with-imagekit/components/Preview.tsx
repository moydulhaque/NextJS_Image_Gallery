import { UpdatedFileObject } from "@/utils/types";
import { IKImage } from "imagekit-next";
import { Dispatch, SetStateAction } from "react";

const Preview = ({
  images,
  currentIndex = 0,
  setCurrentIndex,
}: {
  images: UpdatedFileObject[];
  currentIndex: number;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
}) => {
  return (
    <div className="absolute flex bottom-10 gap-8">
      {images.map((data) => (
        <IKImage
          key={data.fileId}
          urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}
          src={data.fileType === "image" ? data.url : data.thumbnail}
          width={100}
          height={100}
          alt="test"
          className={`${
            currentIndex === data.index
              ? "opacity-100"
              : `inset-0 bg-black opacity-60`
          } hover:opacity-100 cursor-pointer`}
          transformation={[{ width: "100", height: "100" }]}
          onClick={() => setCurrentIndex(data.index)}
        />
      ))}
    </div>
  );
};

export default Preview;
