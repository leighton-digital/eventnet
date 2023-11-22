"use client";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
SyntaxHighlighter.registerLanguage("json", json);
import React from "react";
import leightonLogo from "./Leighton-logo.svg";
import { EventCard } from "./EventCard";
import { EmptyCard } from "./EmptyCard";
import { EventSavedCard } from "./EventSavedCard";
import { copyToClipBoard } from "./copyToClipBoard";
import { Transition } from "@tailwindui/react";

import {
  Drawer,
  Typography,
  IconButton,
  Badge,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Card,
  CardBody,
} from "@material-tailwind/react";

import { Grow } from "@mui/material";
import {
  XMarkIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
  ClipboardIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  LinkIcon,
} from "@heroicons/react/20/solid";
import Image from "next/image";

let eventsList: any = [];
let displayedEvent: any = {};

export default function Home() {
  const [loaded, setLoaded] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [openPop, setOpenPop] = React.useState(false);
  const [allEvents, setAllEvent] = React.useState<any>([]);
  const [savedEvents, setSavedEvent] = React.useState<any>([]);
  const [savedCount, setSavedCount] = React.useState("0");

  const openDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);
  const handleOpen = (id: string) => {
    if (id) {
      displayedEvent = eventsList.find((element: any) => element?.id === id);
    }
    setOpenPop(!openPop);
  };

  React.useEffect(() => {
    const saved = localStorage.getItem("eventStore");
    if (saved) {
      const saveToState = JSON.parse("[null]");
      if (!saveToState[0] === null) {
        eventsList = saveToState;
        setSavedEvent(saveToState);
        setAllEvent(saveToState);
        const count = saveToState.length;
        setSavedCount(`${count}`);
      } else {
        eventsList = [];
        setSavedEvent([]);
        setAllEvent([]);
        const count = 0;
        setSavedCount(`${count}`);
      }
    }
  }, []);

  const saveEvent = (id: string) => {
    let foundEvent;
    const saved = savedEvents.find((element: any) => element?.id === id);
    if (id && !saved) {
      foundEvent = eventsList.find((element: any) => element?.id === id);
      savedEvents.push(foundEvent);
      localStorage.setItem("eventStore", JSON.stringify(savedEvents));
    }
    setSavedCount(savedEvents.length);
  };

  const removeEvent = (id: string) => {
    if (id) {
      const filteredEvents = savedEvents.filter(
        (element: any) => element?.id !== id
      );
      const count = savedEvents.length - 1;
      setSavedCount(`${count}`);
      setSavedEvent(filteredEvents);
      localStorage.setItem("eventStore", JSON.stringify(filteredEvents));
    }
  };

  const updateInputValue = (val: string) => {
    setUrl(val);
  };

  const handleConnect = () => {
    if (url !== "") {
      const WsClient = new WebSocket(url);

      WsClient.onopen = function (e) {
        setLoaded(true);
      };
      WsClient.onmessage = (event: any) => {
        eventsList = [JSON.parse(event.data), ...eventsList];
        setAllEvent(eventsList);
      };
    }
  };

  return (
    <div>
      {loaded ? (
        <React.Fragment>
          <Dialog open={openPop} handler={handleOpen}>
            <DialogHeader>EventBridge Event</DialogHeader>
            <DialogBody divider>
              <form>
                <div className="mb-6">
                  <label
                    htmlFor="source"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Event Source
                  </label>
                  <input
                    type="text"
                    id="source"
                    disabled={true}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={displayedEvent.source}
                  ></input>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="detailtype"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Event Detail Type
                  </label>
                  <input
                    type="text"
                    id="detailtype"
                    disabled={true}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={displayedEvent["detail-type"]}
                  ></input>
                </div>
              </form>
              <div className="event-content max-h-96 overflow-y-scroll">
                <SyntaxHighlighter language="json" style={docco}>
                  {JSON.stringify(displayedEvent, null, "\t")}
                </SyntaxHighlighter>
              </div>
            </DialogBody>
            <DialogFooter>
              {savedEvents.find(
                (element: any) => element.id === displayedEvent.id
              ) ? (
                <button
                  onClick={(event) => removeEvent(displayedEvent.id)}
                  type="button"
                  className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                >
                  <BookmarkSlashIcon className="h-5 w-5 text-white-500 px-0 py-0 mr-1" />
                  Remove
                </button>
              ) : (
                <button
                  onClick={(event) => saveEvent(displayedEvent.id)}
                  type="button"
                  className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                >
                  <BookmarkIcon className="h-5 w-5 text-white-500 px-0 py-0 mr-1" />
                  Save
                </button>
              )}
              <button
                onClick={(event) => copyToClipBoard(displayedEvent)}
                type="button"
                className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
              >
                <ClipboardIcon className="h-5 w-5 text-white-500 px-0 py-0 mr-1" />
                Copy
              </button>
              <button
                onClick={() => handleOpen("")}
                type="button"
                className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
              >
                <XMarkIcon className="h-5 w-5 text-white-500 px-0 py-0 mr-1" />
                Close Event
              </button>
            </DialogFooter>
          </Dialog>
          <div className="fixed bottom-5 right-10 text-blue-500">
            <Badge content={savedCount} placement="top-end" overlap="circular">
              <button
                onClick={openDrawer}
                type="button"
                className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
              >
                <EnvelopeIcon className="h-5 w-5 text-white-500 px-0 py-0 mr-1" />
                Saved Events
              </button>
            </Badge>
          </div>

          <div className="event-cards p-4 flex flex-wrap items-left">
            {allEvents.map(function (object: any, i: any) {
              return (
                <EventCard
                  key={i}
                  eventEnvelope={object}
                  handleClick={handleOpen}
                  handleSave={saveEvent}
                  drawEvents={savedEvents}
                  handleRemove={removeEvent}
                ></EventCard>
              );
            })}
          </div>

          <Drawer
            open={open}
            onClose={closeDrawer}
            size={400}
            placement="bottom"
          >
            <div className="flex items-center justify-between p-3">
              <Typography variant="h5" color="blue-gray">
                Saved Events
              </Typography>
              <IconButton
                variant="text"
                color="blue-gray"
                onClick={closeDrawer}
              >
                <XMarkIcon strokeWidth={2} className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="event-drawer p-3 overflow-x-scroll flex">
              {savedEvents.length === 0 ? (
                <EmptyCard></EmptyCard>
              ) : (
                savedEvents.map(function (object: any, i: any) {
                  return (
                    <EventSavedCard
                      key={i}
                      eventEnvelope={object}
                      handleClick={handleOpen}
                      handleSave={removeEvent}
                    ></EventSavedCard>
                  );
                })
              )}
            </div>
          </Drawer>
        </React.Fragment>
      ) : (
        <div className="w-full h-screen flex items-center justify-center">
          <Card
            color="red"
            variant="gradient"
            className="w-full max-w-[50rem] p-8 text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
          >
            <CardBody className="p-0 text-left">
              <Image
                src={leightonLogo}
                alt="Leighton Logo"
                className="pb-4 pt-2 w-48"
              />
              <Typography
                variant="h5"
                color="white"
                className="mt-6 flex gap-1 text-6xl font-normal"
              >
                EventNet
              </Typography>
              <div className="mb-1 col pt-5">
                <input
                  type="text"
                  id="wsurl"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="wss://yoururl"
                  onChange={(event) => updateInputValue(event.target.value)}
                ></input>

                <button
                  onClick={(event) => handleConnect()}
                  type="button"
                  className="mt-3 px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                >
                  <LinkIcon className="h-5 w-5 text-white-500 px-0 py-0 mr-1" />
                  Connect
                </button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
