import { equ_lump } from "./equ_lump";
import { knuthShuffle } from "./math_utils";
import { ring_lump } from "./ring_lump";
import { sep_lump } from "./sep_lump";

document.addEventListener("DOMContentLoaded", () => {
  init();
});

var results: HTMLElement;
var size_dropdown: HTMLInputElement;
var player_field: HTMLInputElement;
var center_dropdown: HTMLInputElement;

function init() {
  results = document.getElementById("results") as HTMLElement;
  size_dropdown = document.getElementById("size dropdown") as HTMLInputElement;
  player_field = document.getElementById("player field") as HTMLInputElement;
  center_dropdown = document.getElementById(
    "center dropdown"
  ) as HTMLInputElement;
  document
    .getElementById("search button")
    ?.addEventListener("click", search_clicked);
  document
    .getElementById("center reroll button")
    ?.addEventListener("click", reroll_center_clicked);
}

const enum gen_type {
  Equidistant = "Equidistant",
  Ring = "Ring",
  Separated = "Separated",
  Random = "Random",
  None = "None",
}

var options: [string[], string[], gen_type][] = [];
var option_i = 0;
var center_i = 0;
var picked_option: [string[], string[], gen_type] = [[], [], gen_type.None];
var possible_centers: string[] = [];
var prev_settings = "";
function search_clicked() {
  var size_int = -1;
  switch (size_dropdown.value) {
    case "Adjacent":
      size_int = 1;
      break;
    case "Close":
      size_int = 2;
      break;
    case "Far":
      size_int = 3;
      break;
    case "Furthest":
      size_int = 4;
      break;
    default:
      console.error("size_dropdown.value has unexpected value");
      size_int = 1;
      break;
  }

  if (Number(player_field.value) > 24) {
    player_field.value = "24";
  } else if (Number(player_field.value) < 2) {
    player_field.value = "2";
  } else {
    player_field.value = String(Math.round(Number(player_field.value)));
  }
  var player_count: number = Number(player_field.value);

  var curr_settings = `[${player_count}, ${size_int}]${center_dropdown.value}`;
  if (curr_settings != prev_settings) {
    prev_settings = curr_settings;
    var su = sep_lump.get(`[${player_count}, ${size_int}]`);
    var eu = equ_lump.get(`[${player_count}, ${size_int}]`);
    var ru = ring_lump.get(`[${player_count}, ${size_int}]`);

    var s: [string[], string[], gen_type][] = [];
    var e: [string[], string[], gen_type][] = [];
    var r: [string[], string[], gen_type][] = [];

    options = [];
    if (su != undefined) {
      s = su.map((x) => {
        return [x[0], x[1], gen_type.Separated];
      });
    }
    if (eu != undefined) {
      e = eu.map((x) => {
        return [x[0], x[1], gen_type.Equidistant];
      });
    }
    if (ru != undefined) {
      r = ru.map((x) => {
        return [x[0], x[1], gen_type.Ring];
      });
    }

    options = options.concat(e);
    options = options.concat(r);
    options = center_filter(options);
    if (options.length == 0) {
      options = options.concat(s);
      options = center_filter(options);
    }
    if (options.length == 0) {
      if (size_int == 1 && center_dropdown.value != "w" && player_count > 2) {
        options = [gen_random_map(player_count)];
      } else {
        options = [[[], [], gen_type.None]];
      }
    } else {
      options = knuthShuffle(options);
    }

    option_i = 0;
    center_i = 0;
  } else {
    if (options[option_i][2] == gen_type.Random) {
      options = [gen_random_map(player_count)];
    } else {
      option_i += 1;
      if (option_i >= options.length) {
        option_i = 0;
      }
    }
  }

  picked_option = options[option_i];
  possible_centers = picked_option[1];

  display_roll();
}

function center_filter(options) {
  switch (center_dropdown.value) {
    case "w":
      options = options.filter((option) => {
        return option[1].length != 0;
      });
      break;
    case "w/o":
      options = options.filter((option) => {
        return option[1].length == 0;
      });
      break;
    case "idc":
      break;
    default:
      console.error("center_dropdown.value has unexpected value");
      break;
  }
  return options;
}

function reroll_center_clicked() {
  center_i += 1;
  if (center_i >= possible_centers.length) {
    center_i = 0;
  }

  display_roll();
}

function display_roll() {
  if (picked_option[2] == gen_type.None) {
    results.innerHTML = gen_error_message();
  } else {
    results.innerHTML = `Courses:<br>${picked_option[0]}<br>Center:<br>${possible_centers[center_i]}<br>Generation Type:${picked_option[2]}`;
  }
}

function gen_error_message(): string {
  var size = size_dropdown.value;
  var player_count: number = Number(player_field.value);

  if (player_count >= 8 && size != "Adjacent") {
    return "Only 'Adjacent' maps are possible with 8 or more teams.";
  }
  if (size == "Furthest" && player_count != 2) {
    return "'Furthest' maps are only possible with exactly 2 teams.";
  }
  if (size == "Far" && player_count > 4) {
    return "'Far' maps are only possible with 4 or less teams.";
  }
  if (
    (size == "Adjacent" && player_count == 2) ||
    (size == "Close" && player_count == 2) ||
    (size == "Far" && player_count == 4) ||
    (size == "Furthest" && player_count == 2)
  ) {
    return "Only maps with centers are possible. Change the filter to see them.";
  }
  if (
    (size == "Close" && player_count == 7) ||
    (size == "Adjacent" && player_count >= 8)
  ) {
    return "Only maps with out centers are possible. Change the filter to see them.";
  }
  return "Nothing found with those settings.";
}

const all_courses = [
  "Mario Bros. Circuit",
  "Crown City",
  "Whistlestop Summit",
  "DK Spaceport",
  "Desert Hills",
  "Shy Guy Bazaar",
  "Wario Stadium",
  "Airship Fortress",
  "DK Pass",
  "Starview Peak",
  "Sky-High Sundae",
  "Wario Shipyard",
  "Koopa Troopa Beach",
  "Faraway Oasis",
  "Peach Stadium",
  "Peach Beach",
  "Salty Salty Speedway",
  "Dino Dino Jungle",
  "Great ? Block Ruins",
  "Cheep Cheep Falls",
  "Dandelion Depths",
  "Boo Cinema",
  "Dry Bones Burnout",
  "Moo Moo Meadows",
  "Choco Mountain",
  "Toad's Factory",
  "Bowser's Castle",
  "Acorn Heights",
  "Mario Circuit",
  // "Rainbow Road",
];
function gen_random_map(player_count: number): [string[], string[], gen_type] {
  var picked_courses: string[] = [];
  var remaining_courses = all_courses.slice();
  while (picked_courses.length < player_count) {
    remaining_courses = knuthShuffle(remaining_courses);
    var x = remaining_courses.pop() as string;
    picked_courses.push(x);
  }

  return [picked_courses, [], gen_type.Random];
}
