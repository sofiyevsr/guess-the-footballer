import Image from "next/image";
import { ASSET_URL } from "./constants";
import { SinglePlayerData } from "./services/game/types/game";

interface SingleTip {
  id: string;
  title: string;
  text?: string | JSX.Element;
  children?: JSX.Element;
}

export const getTips = (player: SinglePlayerData): SingleTip[] => [
  {
    id: "dob",
    title: "Date of Birth",
    text: player.dateOfBirth,
  },
  {
    id: "main_position",
    title: "Main Position",
    text: player.playerMainPosition,
  },
  {
    id: "shirt_number",
    title: "Shirt Number",
    text: player.shirtNumber === -1 ? "-" : player.shirtNumber.toString(),
    children: (
      <div className="relative w-20 h-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Image
          src="/shirt-black.png"
          alt="t-shirt"
          width={123}
          height={107}
          className="object-cover rounded-full"
        />
      </div>
    ),
  },
  {
    id: "foot",
    title: "Foot",
    text: <span className="uppercase">{player.foot}</span>,
  },
  {
    id: "age",
    title: "Age",
    text: player.age.toString(),
  },
  {
    id: "height",
    title: "Height",
    text: `${player.height}m`,
  },
  {
    id: "birthplace",
    title: "Birthplace",
    text: `${player.birthplace}, ${player.birthplaceCountry}`,
  },
  {
    id: "country",
    title: "Country",
    text: player.countryName,
    children: (
      <div className="relative w-20 h-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Image
          src={ASSET_URL + "/" + player.countryImage}
          alt="tip_image"
          fill
          className="object-cover rounded-full brightness-[.35]"
        />
      </div>
    ),
  },
];
