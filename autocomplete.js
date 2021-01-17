function createAutoComplete({
  root,
  renderOption,
  onOptionSelect,
  inputValue,
  search,
}) {
  root.innerHTML = `
    <label><b>Search</b></label>
    <input class="input" />
    <div class="dropdown">
      <div class="dropdown-menu">
        <div class="dropdown-content results"></div>
      </div>
    </div>
  `;

  const input = root.querySelector("input");
  const dropdown = root.querySelector(".dropdown");
  const resultsWrapper = root.querySelector(".results");

  async function onInput(event) {
    const items = await search(event.target.value);

    if (!items.length) {
      dropdown.classList.remove("is-active");
      return;
    }

    resultsWrapper.innerHTML = "";
    for (let item of items) {
      const option = document.createElement("a");
      option.classList.add("dropdown-item");
      option.innerHTML = renderOption(item);
      option.addEventListener("click", () => {
        dropdown.classList.remove("is-active");
        input.value = inputValue(item);
        onOptionSelect(item);
      });

      resultsWrapper.append(option);
    }

    dropdown.classList.add("is-active");
  }

  input.addEventListener("input", debounce(onInput));
  input.addEventListener("click", () => {
    if (resultsWrapper.innerHTML !== "") {
      dropdown.classList.add("is-active");
    }
  });
  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) {
      dropdown.classList.remove("is-active");
    }
  });
}
