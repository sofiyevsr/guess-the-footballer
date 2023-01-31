import Image from "next/image";
import { ASSET_URL } from "./constants";
import { SinglePlayerData } from "./services/game/types/game";

export interface SingleTip {
  id: string;
  title: string;
  text?: string | JSX.Element;
  children?: JSX.Element;
}

export const getTips = (player: SinglePlayerData): SingleTip[] => {
  const clubReplacement =
    player.clubID === -1
      ? {
          id: "dob",
          title: "Date of Birth",
          text: player.dateOfBirth,
        }
      : {
          id: "club",
          title: "Club",
          text: player.clubName,
          children: (
            <div className="relative w-24 h-24 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Image
                src={ASSET_URL + "/" + player.clubImage}
                alt="club_tip_image"
                width={80}
                height={80}
                className="object-contain brightness-[.4] w-full h-full"
              />
            </div>
          ),
        };
  return [
    clubReplacement,
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
            sizes="50vw"
            fill
            className="object-cover rounded-full w-auto h-auto"
          />
        </div>
      ),
    },
    {
      id: "foot",
      title: "Foot",
      text: <span className="capitalize">{player.foot}</span>,
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
      text: `${player.birthplace}`,
    },
    {
      id: "country",
      title: "Country",
      text: player.countryName,
      children: (
        <div className="relative w-24 h-24 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Image
            src={ASSET_URL + "/" + player.countryImage}
            alt="tip_image"
            width={80}
            height={80}
            className="object-cover rounded-full brightness-[.4] w-full h-full"
          />
        </div>
      ),
    },
  ];
};
