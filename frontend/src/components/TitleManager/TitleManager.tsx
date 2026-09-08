import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectSideMenu  } from "../../stores/sideMenuSlice";

type Menu = {
  icon?: string;
  id?: any;
  title?: string;
  pathname?: string;
  subMenu?: Menu[];
  ignore?: boolean;
};

function findTitleForPath(menu: Array<Menu | "divider">, path: string): string | null {
  for (const m of menu) {
    if (m === "divider") continue;
    if (m.pathname && m.pathname === path) return m.title || null;
    if (m.pathname && path.startsWith(m.pathname + "/")) return m.title || null;
    if (m.pathname && path === m.pathname) return m.title || null;
    if (m.subMenu && m.subMenu.length > 0) {
      const found = findTitleForPath(m.subMenu as Array<Menu | "divider">, path);
      if (found) return found;
    }
  }
  return null;
}

export default function TitleManager() {
  const location = useLocation();
  const menu = useSelector(selectSideMenu) as Array<Menu | "divider">;

  useEffect(() => {
    const baseAppTitle = "HUB";
    try {
      const titleFromMenu = findTitleForPath(menu, location.pathname);
      document.title = titleFromMenu ? `${titleFromMenu} - ${baseAppTitle}` : baseAppTitle;
    } catch (err) {
      document.title = "HUB";
    }
  }, [location.pathname, menu]);

  return null;
}