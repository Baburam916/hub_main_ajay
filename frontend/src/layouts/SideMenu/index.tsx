import { Transition } from "react-transition-group";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { selectSideMenu } from "../../stores/sideMenuSlice";
import { useAppSelector } from "../../stores/hooks";
import { FormattedMenu, linkTo, nestedMenu, enter, leave } from "./side-menu";
import Lucide from "../../base-components/Lucide";
import logoUrl from "../../assets/images/Side_logo.png";
import clsx from "clsx";
import TopBar from "../../components/TopBar";
import MobileMenu from "../../components/MobileMenu";
import DarkModeSwitcher from "../../components/DarkModeSwitcher";
import MainColorSwitcher from "../../components/MainColorSwitcher";
import SideMenuTooltip from "../../components/SideMenuTooltip";
import { useLogin } from "../../components/LoginContext";

function Main() {
  const location = useLocation();
  const [formattedMenu, setFormattedMenu] = useState<
    Array<FormattedMenu | "divider">
  >([]);
  const sideMenuStore = useAppSelector(selectSideMenu);
  const sideMenu = () => nestedMenu(sideMenuStore, location);
  const { userdata } = useLogin();
  const permissions = userdata?.role_permission?.map((item) => item.p_id);

  useEffect(() => {
    setFormattedMenu(sideMenu());
  }, [sideMenuStore, location.pathname]);

  return (
    <div className="py-2">
      <MobileMenu />
      <div className="flex mt-[4.7rem] md:mt-0">
        {/* BEGIN: Side Menu */}
        <nav className="overflow-y-scroll h-[89vh] hidden md:block w-[85px] xl:w-[230px]">
          <div className="sticky top-0 bg-[#777779] z-50 pr-5">
            <Link
              to="/hub/dashboard"
              className="flex items-center pt-4 pl-5 intro-x"
            >
              <img
                className="w-100 "
                src={logoUrl}
                style={{ filter: "drop-shadow(5px 5px 3px #222)" }}
              />
            </Link>
            <Divider type="div" className="my-6"></Divider>
          </div> 
          <ul className="pr-5 ">
            {/* BEGIN: First Child */}
            {formattedMenu
              ?.filter((item?: any) => {
                if (item?.title == "Dashboard") {
                  return item;
                } else if (!item?.id) {
                  if (item?.title == "Hub Operations") {
                    const permission = userdata?.role_permission?.filter(
                      (pitem: any) =>
                        (pitem?.p_id == 146 ||
                          pitem?.p_id == 147 ||
                          pitem?.p_id == 148 ||
                          pitem?.p_id == 16 ||
                          pitem?.p_id == 17 ||
                          pitem?.p_id == 18 ||
                          pitem?.p_id == 21 ||
                          pitem?.p_id == 22 ||
                          pitem?.p_id == 23 ||
                          pitem?.p_id == 24 ||
                          pitem?.p_id == 69 ||
                          pitem?.p_id == 58 ||
                          pitem?.p_id == 19 ||
                          pitem?.p_id == 150 ||
                          pitem?.p_id == 151 ||
                          pitem?.p_id == 152 ||
                          pitem?.p_id == 68 ||
                          pitem?.p_id == 153 ||
                          pitem?.p_id == 154 ||
                          pitem?.p_id == 155 ||
                          pitem?.p_id == 436) &&
                        pitem?.read_permission == 1,
                    );
                    if (permission?.length > 0) {
                      return item;
                    }
                    return;
                  } else if (item?.title == "Accounts") {
                    const permission = userdata?.role_permission?.filter(
                      (pitem: any) =>
                        (pitem?.p_id == 59 || pitem?.p_id == 149) &&
                        pitem?.read_permission == 1,
                    );
                    if (permission?.length > 0) {
                      return item;
                    }
                    return;
                  } else if (item?.title == "AWB & KYC") {
                    const permission = userdata?.role_permission?.filter(
                      (pitem: any) =>
                        pitem?.p_id == 156 && pitem?.read_permission == 1,
                    );
                    if (permission?.length > 0) {
                      return item;
                    }
                    return;
                  } else if (item?.title == "Reports") {
                    const permission = userdata?.role_permission?.filter(
                      (pitem: any) =>
                        (pitem?.p_id == 26 || pitem?.p_id == 27) &&
                        pitem?.read_permission == 1,
                    );
                    if (permission?.length > 0) {
                      return item;
                    }
                    return;
                  }
                } else {
                  const permission = userdata?.role_permission.filter(
                    (pitem: any) =>
                      pitem?.p_id == item?.id && pitem?.read_permission == 1,
                  );
                  if (permission?.length > 0) {
                    return item;
                  }
                  return;
                }
              })
              ?.map((menu, menuKey) =>
                menu == "divider" ? (
                  <Divider
                    type="li"
                    className={clsx([
                      "my-6",

                      // Animation
                      `opacity-0 animate-[0.4s_ease-in-out_0.1s_intro-divider] animate-fill-mode-forwards animate-delay-${
                        (menuKey + 1) * 10
                      }`,
                    ])}
                    key={menuKey}
                  ></Divider>
                ) : (
                  <li key={menuKey}>
                    <Menu
                      className={clsx({
                        // Animation
                        [`opacity-0 translate-x-[50px] animate-[0.4s_ease-in-out_0.1s_intro-menu] animate-fill-mode-forwards animate-delay-${
                          (menuKey + 1) * 10
                        }`]: !menu.active,
                      })}
                      menu={menu}
                      formattedMenuState={[formattedMenu, setFormattedMenu]}
                      level="first"
                    ></Menu>
                    {/* BEGIN: Second Child */}
                    {menu.subMenu && (
                      <Transition
                        in={menu.activeDropdown}
                        onEnter={enter}
                        onExit={leave}
                        timeout={300}
                      >
                        <ul
                          className={clsx([
                            "bg-black/10 rounded-lg dark:bg-darkmode-900/30",
                            { block: menu.activeDropdown },
                            { hidden: !menu.activeDropdown },
                          ])}
                        >
                          {menu.subMenu
                            .filter((item2) => {
                              const permission = userdata?.role_permission.find(
                                (pitem: any) => pitem?.p_id == item2?.id,
                              );

                              return (
                                permission &&
                                permission.read_permission != 0 &&
                                permissions.includes(item2?.id)
                              );
                            })
                            .sort((a, b) => a.title.localeCompare(b.title))
                            .map((subMenu, subMenuKey) => (
                              <li key={subMenuKey}>
                                <Menu
                                  className={clsx({
                                    // Animation
                                    [`opacity-0 translate-x-[50px] animate-[0.4s_ease-in-out_0.1s_intro-menu] animate-fill-mode-forwards animate-delay-${
                                      (subMenuKey + 1) * 10
                                    }`]: !subMenu.active,
                                  })}
                                  menu={subMenu}
                                  formattedMenuState={[
                                    formattedMenu,
                                    setFormattedMenu,
                                  ]}
                                  level="second"
                                ></Menu>
                                {/* BEGIN: Third Child */}
                                {subMenu.subMenu && (
                                  <Transition
                                    in={subMenu.activeDropdown}
                                    onEnter={enter}
                                    onExit={leave}
                                    timeout={300}
                                  >
                                    <ul
                                      className={clsx([
                                        "bg-black/10 rounded-lg dark:bg-darkmode-900/30",
                                        {
                                          block: subMenu.activeDropdown,
                                        },
                                        { hidden: !subMenu.activeDropdown },
                                      ])}
                                    >
                                      {subMenu.subMenu
                                        .filter((item2) => {
                                          const permission =
                                            userdata?.role_permission.find(
                                              (pitem: any) =>
                                                pitem?.p_id == item2?.id,
                                            );
                                          return (
                                            permission &&
                                            permission.read_permission != 0 &&
                                            permissions.includes(item2?.id)
                                          );
                                        })
                                        .map((lastSubMenu, lastSubMenuKey) => (
                                          <li key={lastSubMenuKey}>
                                            <Menu
                                              className={clsx({
                                                // Animation
                                                [`opacity-0 translate-x-[50px] animate-[0.4s_ease-in-out_0.1s_intro-menu] animate-fill-mode-forwards animate-delay-${
                                                  (lastSubMenuKey + 1) * 10
                                                }`]: !lastSubMenu.active,
                                              })}
                                              menu={lastSubMenu}
                                              formattedMenuState={[
                                                formattedMenu,
                                                setFormattedMenu,
                                              ]}
                                              level="third"
                                            ></Menu>
                                          </li>
                                        ))}
                                    </ul>
                                  </Transition>
                                )}
                                {/* END: Third Child */}
                              </li>
                            ))}
                        </ul>
                      </Transition>
                    )}
                    {/* END: Second Child */}
                  </li>
                ),
              )}
            {/* END: First Child */}
          </ul>
        </nav>
        {/* END: Side Menu */}
        {/* BEGIN: Content */}
        <div className="rounded-[5px] lg:rounded-[14px] lg:overflow-auto min-w-0 lg:min-h-[94vh] lg:h-[90vh] scrollbar-hide  flex-1 bg-slate-100 dark:bg-darkmode-700 pb-4 px-2 lg:px-4 md:px-[22px] max-w-full md:max-w-auto before:content-[''] before:w-full before:block boxinner">
          <TopBar />
          <Outlet />
        </div>
        {/* END: Content */}
      </div>
    </div>
  );
}

function Menu(props: {
  className?: string;
  menu: FormattedMenu;
  formattedMenuState: [
    (FormattedMenu | "divider")[],
    Dispatch<SetStateAction<(FormattedMenu | "divider")[]>>,
  ];
  level: "first" | "second" | "third";
}) {
  const navigate = useNavigate();
  const [formattedMenu, setFormattedMenu] = props.formattedMenuState;

  return (
    <SideMenuTooltip
      as="a"
      content={props.menu.title}
      href={props.menu.subMenu ? "#" : props.menu.pathname}
      className={clsx([
        "h-[50px] flex items-center pl-3 text-white mb-1 relative rounded-full",
        {
          "dark:text-slate-300": props.menu.active && props.level != "first",
          "text-white/70 dark:text-slate-400":
            !props.menu.active && props.level != "first",
          "z-10 bg-slate-100 dark:bg-darkmode-700":
            props.menu.active && props.level == "first",
          "before:content-[''] before:w-[30px] before:h-[30px] before:-mt-[30px] before:rotate-90 before:scale-[1.04] before:bg-[length:100%] before:bg-menu-corner before:absolute before:top-0 before:right-0 before:-mr-5 dark:before:bg-menu-corner-dark":
            props.menu.active && props.level == "first",
          "after:content-[''] after:w-[30px] after:h-[30px] after:mt-[50px] after:scale-[1.04] after:bg-[length:100%] after:bg-menu-corner after:absolute after:top-0 after:right-0 after:-mr-5 dark:after:bg-menu-corner-dark":
            props.menu.active && props.level == "first",
          "[&>div:nth-child(1)]:hover:before:bg-white/5 [&>div:nth-child(1)]:hover:before:dark:bg-darkmode-500/70":
            !props.menu.active &&
            !props.menu.activeDropdown &&
            props.level == "first",
        },
        props.className,
      ])}
      onClick={(event: React.MouseEvent) => {
        event.preventDefault();
        linkTo(props.menu, navigate);
        setFormattedMenu([...formattedMenu]);
      }}
    >
      <div
        className={clsx({
          "text-primary dark:text-slate-300":
            props.menu.active && props.level == "first",
          "dark:text-slate-400": !props.menu.active && props.level == "first",
          "before:content-[''] before:z-[-1] before:absolute before:top-0 before:right-0 before:-mr-5 before:w-12 before:h-full before:bg-slate-100 before:dark:bg-darkmode-700":
            props.menu.active && props.level == "first",
          "before:content-[''] before:z-[-1] before:w-[230px] before:absolute before:top-0 before:left-0 before:h-full before:rounded-l-full before:transition before:ease-in before:duration-100":
            !props.menu.activeDropdown &&
            !props.menu.active &&
            props.level == "first",
        })}
      >
        <Lucide icon={props.menu.icon} />
      </div>
      <div
        className={clsx([
          "hidden xl:flex items-center w-full ml-2",
          { "font-medium": props.menu.active && props.level != "first" },
          {
            "text-slate-800 font-medium dark:text-slate-300":
              props.menu.active && props.level == "first",
          },
          {
            "dark:text-slate-400": !props.menu.active && props.level == "first",
          },
        ])}
      >
        {props.menu.title}
        {props.menu.subMenu && (
          <div
            className={clsx([
              "transition ease-in duration-100 ml-auto mr-5 hidden xl:block",
              { "transform rotate-180": props.menu.activeDropdown },
            ])}
          >
            <Lucide className="w-4 h-4" icon="ChevronDown" />
          </div>
        )}
      </div>
    </SideMenuTooltip>
  );
}

function Divider<C extends React.ElementType>(
  props: { as?: C } & React.ComponentPropsWithoutRef<C>,
) {
  const { className, ...computedProps } = props;
  const Component = props.as || "div";

  return (
    <Component
      {...computedProps}
      className={clsx([
        props.className,
        "w-full h-px bg-white/[0.08] z-10 relative dark:bg-white/[0.07]",
      ])}
    ></Component>
  );
}

export default Main;
