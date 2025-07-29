import React from "react";

export const WriteAEmailMessage = () => {
  return (
    <div className="bg-grey-lightest pt-8 font-sans">
      <div className="row sm:flex">
        <div className="col sm:w-full">
          <div className="box flex flex-col rounded border bg-white shadow">
            <div className="box__title bg-grey-lighter border-b px-3 py-2">
              <h3 className="text-grey-darker text-sm font-medium text-black">
                Write a Message to all your friends
              </h3>
            </div>
            <textarea
              placeholder="Write an extra message to all friends"
              className="text-grey-darkest m-1 flex-1 bg-transparent p-2"
              name="tt"
            >
              hello world
            </textarea>
          </div>
        </div>
      </div>
    </div>
  );
};
