import { useGroup } from "@frigade/react";
import { useEffect, useState } from "react";

export default {
  title: "Hooks/useGroup",
};

export function Default() {
  const { addProperties } = useGroup();
  const [hasSetProps, setHasSetProps] = useState(false);
  useEffect(() => {
    async function setProps() {
      await addProperties({
        orgPicture: "https://placekitten.com/24/24",
      });
      setHasSetProps(true);
    }

    setProps();
  }, []);

  return (
    <div>
      <div id="">
        hasSuccessFullySentPropsToFrigadeAPI: {hasSetProps ? "true" : "false"}
      </div>
    </div>
  );
}
