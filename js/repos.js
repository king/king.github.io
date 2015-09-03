      // Ramdom box color
      var colorBoxes = ["yellowBox", "pinkBox", "greenBox", "grayBox"];
      var lastColor = "";

      // In case of Custom repo URL add it to this array [Key = repo name]
      var repoUrls = {
        "repo_example": "http://king.github.com/myRepoHasADifferentURL/"
      };

      // To overwrite a repo description add it to this array [Key = repo name]
      var repoDescriptions = {
        "repo_example": "A different description provided by me :-)"
      };

      /* It returns the Repo URL taking precedence the contents of internal array 'repoUrls' */
      function getRepoUrl(repo) {
        return repoUrls[repo.name] || repo.html_url;
      }
      /* It returns the Repo Description taking precedence the contents of internal array 'repoDescriptions' */
      function getRepoDescription(repo) {
        return repoDescriptions[repo.name] || repo.description;
      }

      /**
         It adds the "Recently Updated" repos to proper HTML element.
         It creates one line with 2 links for each repo:
           <a href="repo_url" class="name">repo_name</a><a href="repo_url/commits" class="time"> (repo_pushed_at) </a>
      */
      function addRecentlyUpdatedRepo(repo) {
        var $item = $("<li>");

        var $name = $("<a>").attr("href", repo.html_url).text(repo.name);
        $item.append($("<span>").addClass("name").append($name));

        var $time = $("<a>").attr("href", repo.html_url + "/commits").text("(" +strftime("%h %e, %Y", repo.pushed_at)+")");
        $item.append($("<span>").addClass("time").append($time));

        $item.appendTo("#recent-repo-list");
      }

      function addKingRepo(repo) {
        var $item = $("<li>").addClass("repo grid1x " + getRandomColor());
        var $link = $("<a>").attr("href", getRepoUrl(repo)).appendTo($item);

        $link.append($("<h1>").text(repo.name));
        
        var $info = $("<h2>");
        $info.append($("<span>").addClass("octicon octicon-star")).append($("<span>").addClass("info_watchers").text(repo.watchers));
        $info.append($("<span>").addClass("octicon octicon-repo-forked")).append($("<span>").addClass("info_forks").text(repo.forks));
        $info.append($("<span>").addClass("info_language").text(repo.language));
        $link.append($info);

        $link.append($("<p>").text(getRepoDescription(repo)));

        $item.appendTo("#repos");
      }

      function getRandomColor(){
          do {
            retColor = colorBoxes[Math.floor(Math.random() * colorBoxes.length)];
          } while(retColor == lastColor);
          lastColor = retColor;
          return retColor;
      }

      /**
        Call GitHub API to retrieve list fo repositories (100 per page)
      */
      function addKingRepos(repos, page) {
        repos = repos || [];
        page = page || 1;

        var uri = "https://api.github.com/orgs/king/repos?callback=?"
                + "&per_page=100"
                + "&page="+page;

        // Callback from API
        $.getJSON(uri, function (result) {
          // Retrieve all repos (request all pages until response length is 0)
          if (result.data && result.data.length > 0) {
            repos = repos.concat(result.data);
            addKingRepos(repos, page + 1);
          }
          else {
            $(function () {
              $("#num-repos").text(repos.length);

              // Convert "pushed_at" value to date format (for "Updated recently")
              $.each(repos, function (i, repo) {
                repo.pushed_at = new Date(repo.pushed_at);
              });

              // Sort by popularity i.e. highest # of watchers comes first
              repos.sort(function (a, b) {
                if (a.watchers < b.watchers) return 1;
                if (b.watchers < a.watchers) return -1;
                return 0;
              });

              // Add repos to page
              $.each(repos, function (i, repo) {
                addKingRepo(repo);
              });

              // Sort by most-recently pushed to.
              repos.sort(function (a, b) {
                if (a.pushed_at < b.pushed_at) return 1;
                if (b.pushed_at < a.pushed_at) return -1;
                return 0;
              });

              // Add "Recently updated" area with the 3 items at the beggining of the sorted list
              $.each(repos.slice(0, 3), function (i, repo) {
                 addRecentlyUpdatedRepo(repo);
              });
            });
          }
        });
      }

      // Get # of Members
      function getNumMembers(page, numMembers) {
        var page = page || 1;
        var numMembers = numMembers || 0;
        var membersUri = "https://api.github.com/orgs/king/members?callback=?"
          + "&per_page=100"
          + "&page="+page;

        $.getJSON(membersUri, function (result) {
          if (result.data && result.data.length > 0) {
            numMembers += result.data.length;
            getNumMembers(page+1, numMembers);
          } else {
            $(function () {
              $("#num-members").text(numMembers);
            });
          }
        });
      }